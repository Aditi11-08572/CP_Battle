import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ContestInfo.module.css';
import { FaCalendarAlt, FaClock, FaUsers, FaTrophy, FaFlag } from 'react-icons/fa';

const ContestInfo = () => {
  const { contestCode } = useParams();
  const navigate = useNavigate();
  const [contestInfo, setContestInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contestStatus, setContestStatus] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isInvited, setIsInvited] = useState(false);
  const [hasEnteredContest, setHasEnteredContest] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const fetchContestInfo = async () => {
      if (!contestCode) {
        setError('No contest code provided');
        setIsLoading(false);
        return;
      }

      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await axios.get(`https://codecraft-contest1.onrender.com/api/contests/${contestCode}`, {
          params: { userEmail }
        });
        const data = response.data;
        console.log('Received contest data:', data);
        setContestInfo(data);
        setContestStatus(getContestStatus(data));
        setIsRegistered(data.isUserRegistered);
        setIsInvited(data.isUserInvited);
        setIsLoading(false);

        // Check if user has entered this contest before
        const enteredContests = JSON.parse(localStorage.getItem('enteredContests') || '[]');
        setHasEnteredContest(enteredContests.includes(contestCode));

        if (data.questions === undefined || !Array.isArray(data.questions)) {
          // Fetch questions if they're not included in the initial contest data
          try {
            const questionsResponse = await axios.get(`https://codecraft-contest1.onrender.com/api/contests/${contestCode}/questions`);
            setContestInfo(prevInfo => ({...prevInfo, questions: questionsResponse.data}));
          } catch (error) {
            console.error('Error fetching contest questions:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching contest info:', error);
        setError('Failed to fetch contest information');
        setIsLoading(false);
      }
    };

    fetchContestInfo();
  }, [contestCode]);

  useEffect(() => {
    const checkContestSubmission = async () => {
      try {
        const userHandle = localStorage.getItem('codeforcesHandle');
        if (userHandle && contestInfo) {
          const response = await axios.get(`https://codecraft-contest1.onrender.com/api/contests/${contestInfo._id}/check-submission`, {
            params: { userHandle }
          });
          setHasSubmitted(response.data.hasSubmitted);
        }
      } catch (error) {
        console.error('Error checking contest submission:', error);
      }
    };

    checkContestSubmission();
  }, [contestInfo]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (contestInfo) {
        const newStatus = getContestStatus(contestInfo);
        if (newStatus !== contestStatus) {
          setContestStatus(newStatus);
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, [contestInfo, contestStatus]);

  const getContestStatus = (contest) => {
    const now = new Date();
    const startDate = new Date(contest.startDate);
    const endDate = new Date(contest.endDate);
    if (now < startDate) {
      return 'Upcoming';
    } else if (now >= startDate && now < endDate) {
      return 'Ongoing';
    } else {
      return 'Ended';
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await axios.post('https://codecraft-contest1.onrender.com/api/register-contest', {
        userEmail,
        contestId: contestInfo._id
      });

      console.log('Registration response:', response.data);

      if (response.data.success) {
        if (response.data.alreadyRegistered) {
          setRegistrationMessage('You are already registered for this contest.');
        } else {
          setRegistrationMessage('You have successfully registered for the contest!');
        }
        setIsRegistered(true);
      } else {
        setRegistrationMessage('Failed to register for the contest. Please try again.');
      }
    } catch (error) {
      console.error('Error registering for contest:', error);
      if (error.response && error.response.status === 403) {
        setRegistrationMessage('You are not invited to this contest.');
      } else {
        setRegistrationMessage('Failed to register for the contest. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setShowPopup(true);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const renderActionButton = () => {
    console.log('Rendering action button:', { contestStatus, isRegistered, hasSubmitted, hasEnteredContest });
    
    if (contestStatus === 'Upcoming') {
      return (
        <button 
          onClick={handleRegister} 
          className={`${styles.registerButton} ${isLoading ? styles.loading : ''}`}
          disabled={isLoading || isRegistered || !isInvited}
        >
          {isLoading ? 'Loading...' : 
           isRegistered ? 'Registered' : 
           isInvited ? 'Register for Contest' : 'Not Invited'}
        </button>
      );
    } else if (contestStatus === 'Ongoing' || contestStatus === 'Ended') {
      if (isRegistered) {
        // Check if contest is submitted by any participant
        const checkContestSubmission = async () => {
          try {
            const response = await axios.get(`https://codecraft-contest1.onrender.com/api/contests/${contestInfo._id}/status`);
            if (response.data.status === 'SUBMITTED' || hasSubmitted || contestStatus === 'Ended') {
              return (
                <button 
                  onClick={handleViewResults} 
                  className={styles.enterButton}
                >
                  View Results
                </button>
              );
            }
          } catch (error) {
            console.error('Error checking contest submission status:', error);
          }
        };

        return (
          <button 
            onClick={handleEnterContest} 
            className={styles.enterButton}
          >
            {hasEnteredContest ? 'Resume Contest' : 'Enter Contest'}
          </button>
        );
      } else {
        return <p className={styles.notRegistered}>You are not registered for this contest.</p>;
      }
    }
  };

  const handleViewResults = () => {
    console.log("Contest info before navigation:", contestInfo);
    navigate(`/contest-rankings`, {
      state: {
        contestName: contestInfo.contestName,
        participants: contestInfo.registeredUsers.length,
        questions: contestInfo.questions || [], // Log this value
        duration: contestInfo.duration,
        contestId: contestInfo._id
      }
    });
  };

  const handleEnterContest = () => {
    navigate(`/contest-problems`, {
      state: {
        contestName: contestInfo.contestName,
        participants: contestInfo.registeredUsers.length,
        minRating: contestInfo.minRating,
        maxRating: contestInfo.maxRating,
        selectedTags: contestInfo.selectedTags,
        questions: contestInfo.questions,
        duration: contestInfo.duration,
        startTime: new Date(contestInfo.startDate).getTime(),
        contestId: contestInfo._id
      }
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!contestInfo) return <div>No contest information available.</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{contestInfo?.contestName}</h1>
      
      <div className={styles.infoGrid}>
        <InfoItem icon={<FaCalendarAlt />} label="Start Date" value={new Date(contestInfo?.startDate).toLocaleString()} />
        <InfoItem icon={<FaCalendarAlt />} label="End Date" value={new Date(contestInfo?.endDate).toLocaleString()} />
        <InfoItem icon={<FaClock />} label="Duration" value={`${contestInfo?.duration} hours`} />
        <InfoItem icon={<FaUsers />} label="Participants" value={contestInfo?.registeredUsers.length} />
        <InfoItem icon={<FaTrophy />} label="Difficulty" value={contestInfo?.difficulty} />
        <InfoItem icon={<FaFlag />} label="Status" value={contestStatus} data-status={contestStatus} />
      </div>

      {renderActionButton()}

      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <p>{registrationMessage}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value, ...props }) => (
  <div className={styles.infoItem} {...props}>
    {icon}
    <div>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  </div>
);

export default ContestInfo;
