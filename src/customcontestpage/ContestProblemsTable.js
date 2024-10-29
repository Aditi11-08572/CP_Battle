import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import axios from "axios";
import styles from "./ContestProblemsTable.module.css";
import ContestRankingTable from './ContestRankingTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faCheckCircle, faTimesCircle, faClock, faTrophy, faChartLine, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubmittedContests } from '../hooks/useSubmittedContests';

const ContestProblemsTable = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { 
    contestName,
    participants, 
    minRating, 
    maxRating, 
    selectedTags, 
    questions, 
    duration, 
    startTime,
    contestId: initialContestId 
  } = location.state || {};

  // Add state for contestId
  const [contestId, setContestId] = useState(initialContestId || null);

  // Add a state for contest name with a default value
  const [currentContestName, setCurrentContestName] = useState(contestName || "Unnamed Contest");

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [rating, setRating] = useState(1500); 
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [userHandle, setUserHandle] = useState('');
  const [userCodeforcesId, setUserCodeforcesId] = useState('Laxmikant_Mahindrakar'); // Set default hardcoded ID
  const [problemStatuses, setProblemStatuses] = useState({});
  const [points, setPoints] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [lastProcessedSubmissionTime, setLastProcessedSubmissionTime] = useState({});
  const [showRankings, setShowRankings] = useState(false);
  const [isContestOver, setIsContestOver] = useState(false);
  const [isContestSubmitted, setIsContestSubmitted] = useState(false);
  const { submittedContests, addSubmittedContest } = useSubmittedContests();

  const calculateDurationInMilliseconds = (duration) => {
    const hours = Math.floor(duration);
    const minutes = (duration % 1) * 60; 
    return (hours * 60 * 60 + minutes * 60) * 1000; 
  };

  useEffect(() => {
    const fetchUserHandle = async () => {
      // First, try to get the handle from localStorage
      const storedHandle = localStorage.getItem('codeforcesHandle');
      if (storedHandle) {
        setUserHandle(storedHandle);
        return;
      }

      // If not in localStorage, try to fetch from your backend
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          console.error("User email not found in localStorage");
          return;
        }

        const response = await axios.get(`https://codecraft-contest1.onrender.com/api/user`, {
          params: { email: userEmail }
        });

        if (response.data && response.data.codeforcesId) {
          setUserHandle(response.data.codeforcesId);
          localStorage.setItem('codeforcesHandle', response.data.codeforcesId);
          if (response.data.rating !== undefined) {
            setRating(response.data.rating);
          }
        } else {
          console.error("Codeforces ID not found in user data");
        }
      } catch (error) {
        console.error("Error fetching user handle:", error);
        // If fetching fails, you might want to prompt the user to enter their handle
        const promptedHandle = prompt("Please enter your Codeforces handle:");
        if (promptedHandle) {
          setUserHandle(promptedHandle);
          localStorage.setItem('codeforcesHandle', promptedHandle);
        }
      }
    };

    fetchUserHandle();
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://codeforces.com/api/problemset.problems');
        const allProblems = response.data.result.problems;
        
        const filteredProblems = allProblems
          .filter(problem => 
            problem.rating >= minRating &&
            problem.rating <= maxRating &&
            selectedTags.some(tag => problem.tags.includes(tag))
          )
          .slice(0, questions);

        const sortedProblems = filteredProblems.sort((a, b) => a.index.localeCompare(b.index));
        
        setProblems(sortedProblems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching problems:", error);
        setLoading(false);
      }
    };

    fetchProblems();
  }, [minRating, maxRating, selectedTags, questions]);

  useEffect(() => {
    const durationInMilliseconds = parseFloat(duration) * 60 * 60 * 1000; // Convert hours to milliseconds
    const endTime = new Date(startTime).getTime() + durationInMilliseconds;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        setTimeLeft(difference);
      } else {
        setTimeLeft(0);
        clearInterval(timer);
        // Handle contest end
      }
    };

    updateTimer(); // Initial call to set the correct time immediately
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [duration, startTime]);

  useEffect(() => {
    const fetchUserCodeforcesId = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          console.log("User not logged in or in incognito mode. Using hardcoded ID.");
          return; // Keep using the hardcoded ID
        }

        const response = await axios.get(`https://codecraft-contest1.onrender.com/api/user`, {
          params: { email: userEmail }
        });

        if (response.data && response.data.codeforcesId) {
          setUserCodeforcesId(response.data.codeforcesId);
        } else {
          console.log("Codeforces ID not found in user data. Using hardcoded ID.");
        }
      } catch (error) {
        console.error("Error fetching user Codeforces ID:", error);
        console.log("Using hardcoded ID due to error.");
      }
    };

    fetchUserCodeforcesId();
  }, []);

  useEffect(() => {
    // Generate a unique contestId when the component mounts if not provided
    if (!contestId) {
      setContestId(Date.now().toString());
    }
  }, [contestId]);

  useEffect(() => {
    // Load submitted contests from localStorage
    const loadSubmittedContests = () => {
      const storedSubmittedContests = localStorage.getItem('submittedContests');
      if (storedSubmittedContests) {
        // Instead of setting state, we can log it or use it in some other way
        console.log('Loaded submitted contests:', JSON.parse(storedSubmittedContests));
      }
    };

    loadSubmittedContests();
  }, []);

  const updateSolvedProblems = useCallback(async () => {
    if (!userCodeforcesId) {
      console.error("Codeforces ID not available");
      return;
    }

    try {
      const response = await axios.get(`https://codeforces.com/api/user.status`, {
        params: {
          handle: userCodeforcesId,
          from: 1,
          count: 100
        }
      });

      const submissions = response.data.result;
      const newSolvedProblems = new Set(solvedProblems);
      const newProblemStatuses = { ...problemStatuses };
      const newPoints = { ...points };
      const newLastProcessedSubmissionTime = { ...lastProcessedSubmissionTime };
      let newTotalPoints = 0;

      problems.forEach(problem => {
        const problemId = `${problem.contestId}-${problem.index}`;
        const relevantSubmissions = submissions.filter(submission => 
          `${submission.problem.contestId}-${submission.problem.index}` === problemId &&
          submission.creationTimeSeconds * 1000 >= startTime &&
          submission.creationTimeSeconds * 1000 <= (startTime + calculateDurationInMilliseconds(duration)) &&
          submission.creationTimeSeconds > (newLastProcessedSubmissionTime[problemId] || 0)
        ).sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds); // Sort by oldest first

        if (relevantSubmissions.length > 0) {
          let problemPoints = newPoints[problemId] || 0;
          let isSolved = newSolvedProblems.has(problemId);

          relevantSubmissions.forEach(submission => {
            if (submission.verdict === "OK" && !isSolved) {
              problemPoints += 10;
              isSolved = true;
              newSolvedProblems.add(problemId);
            } else if (submission.verdict !== "OK") {
              problemPoints -= 1;
            }
          });

          newProblemStatuses[problemId] = relevantSubmissions[relevantSubmissions.length - 1].verdict;
          newPoints[problemId] = problemPoints;
          newLastProcessedSubmissionTime[problemId] = relevantSubmissions[relevantSubmissions.length - 1].creationTimeSeconds;
        }

        newTotalPoints += newPoints[problemId] || 0;
      });

      setSolvedProblems(newSolvedProblems);
      setProblemStatuses(newProblemStatuses);
      setPoints(newPoints);
      setTotalPoints(newTotalPoints);
      setLastProcessedSubmissionTime(newLastProcessedSubmissionTime);
    } catch (error) {
      console.error("Error updating solved problems:", error);
    }
  }, [userCodeforcesId, problems, solvedProblems, startTime, duration, lastProcessedSubmissionTime]);

  useEffect(() => {
    const interval = setInterval(updateSolvedProblems, 500); // Check every minute
    updateSolvedProblems(); // Check immediately on component mount
    return () => clearInterval(interval);
  }, [updateSolvedProblems]);

  const handleManualRefresh = () => {
    updateSolvedProblems();
  };

  const calculateRating = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error("User email not found in localStorage");
        return;
      }

      // Fetch the current user's rating
      const userResponse = await axios.get(`https://codecraft-contest1.onrender.com/api/user`, {
        params: { email: userEmail }
      });

      if (userResponse.data && userResponse.data.rating !== undefined) {
        setRating(userResponse.data.rating);
      } else {
        console.error("User rating not found");
      }
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };

  const handleSubmitContest = async () => {
    if (!contestId) {
      console.error('Contest ID is not set');
      return;
    }

    try {
      // Prepare the data to be sent to the server
      const contestData = {
        contestId,
        contestName,
        participants,
        questions: problems,
        duration,
        userHandle: userCodeforcesId,
        totalPoints,
        solvedProblems: Array.from(solvedProblems),
        problemStatuses,
        questionPoints: points,
        finishTime: new Date().toISOString(),
      };

      // Send the data to the server
      const response = await axios.post('https://codecraft-contest1.onrender.com/api/contests/submit', contestData);

      if (response.data.success) {
        setIsContestSubmitted(true);
        
        // Add this contest to the submitted contests list
        addSubmittedContest(contestId);
        console.log('Contest submitted:', contestId);

        // Navigate to the ContestRanking page
        navigate('/contest-rankings', { 
          state: { 
            contestId,
            contestName,
            participants,
            questions: problems,
            duration
          },
          replace: true
        });
      } else {
        throw new Error(response.data.message || 'Failed to submit contest');
      }
    } catch (error) {
      console.error('Error submitting contest:', error);
      alert(`Error submitting contest: ${error.message}`);
    }
  };

  // Prevent access to this page if the contest has been submitted
  useEffect(() => {
    if (isContestSubmitted) {
      navigate('/contest-rankings', { replace: true });
    }
  }, [isContestSubmitted, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1000) {  // If less than 1 second left
          clearInterval(timer);
          setIsContestOver(true);
          handleSubmitContest();  // Auto-submit the contest
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitContest]);

  useEffect(() => {
    if (isContestOver) {
      // Redirect to rankings page or home page after a short delay
      const redirectTimer = setTimeout(() => {
        navigate('/rankings', { state: { contestName, participants, questions, duration } });
      }, 5000);  // 5 seconds delay

      return () => clearTimeout(redirectTimer);
    }
  }, [isContestOver, navigate, contestName, participants, questions, duration]);

  const navigateToRecentContests = () => {
    navigate("/recent-contests", { state: { message: "Contest submitted successfully." } });
  };

  const formatTimeLeft = (time) => {
    const hours = Math.floor(time / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "OK": return "Accepted";
      case "PARTIAL": return "Partially Accepted";
      case "COMPILATION_ERROR": return "Compilation Error";
      case "RUNTIME_ERROR": return "Runtime Error";
      case "WRONG_ANSWER": return "Wrong Answer";
      case "TIME_LIMIT_EXCEEDED": return "Time Limit Exceeded";
      case "MEMORY_LIMIT_EXCEEDED": return "Memory Limit Exceeded";
      case "Not submitted": return "Not Submitted";
      default: return status;
    }
  };

  // Sort problems by rating
  const sortedProblems = useMemo(() => {
    return [...problems].sort((a, b) => a.rating - b.rating);
  }, [problems]);

  if (loading) {
    return <div>Loading problems...</div>;
  }

  if (isContestOver) {
    return (
      <div className={styles.contestOverContainer}>
        <h2>Contest is Over</h2>
        <p>Your submissions have been automatically saved.</p>
        <p>Redirecting to rankings page...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.problemsTableContainer}
    >
      <div className={styles.contestHeader}>
        <motion.h1 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {currentContestName} {/* Use the state variable here */}
        </motion.h1>
        <div className={styles.contestInfo}>
          <div className={styles.timerWrapper}>
            <CircularProgressbar
              value={(duration * 60 * 60 * 1000 - timeLeft) / (duration * 60 * 60 * 10)}
              text={formatTimeLeft(timeLeft)}
              styles={buildStyles({
                textSize: '16px',
                pathTransitionDuration: 0.5,
                pathColor: `rgba(62, 152, 199, ${(duration * 60 * 60 * 1000 - timeLeft) / (duration * 60 * 60 * 10)})`,
                textColor: '#3498db',
                trailColor: '#d6d6d6',
                backgroundColor: '#3e98c7',
              })}
            />
          </div>
          <div className={styles.statsWrapper}>
            <motion.div 
              className={styles.stat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>{problems.length}/{questions} Problems</span>
            </motion.div>
            <motion.div 
              className={styles.stat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faTrophy} />
              <span>{totalPoints} Points</span>
            </motion.div>
            <motion.div 
              className={styles.stat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faUser} />
              <span>{userHandle}</span>
            </motion.div>
          </div>
        </div>
      </div>
      
      <motion.button 
        onClick={updateSolvedProblems} 
        className={styles.refreshButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FontAwesomeIcon icon={faSync} spin={loading} /> Refresh Submissions
      </motion.button>

      <div className={styles.tableWrapper}>
        <table className={styles.problemsTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Tags</th>
              {/* <th>Time Limit</th> */}
              <th>Status</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {sortedProblems.map((problem, index) => {
              const problemId = `${problem.contestId}-${problem.index}`;
              const status = problemStatuses[problemId] || "Not submitted";
              const isSolved = status === "OK";
              const problemPoints = points[problemId] || 0;

              return (
                <tr key={problemId} className={isSolved ? styles.solvedProblem : ''}>
                  <td>{index + 1}</td>
                  <td>
                    <a
                      href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.problemLink}
                    >
                      {problem.name}
                    </a>
                  </td>
                  <td>{problem.rating}</td>
                  <td>
                    <div className={styles.tagContainer}>
                      {problem.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className={styles.tag}
                          data-tooltip-id={`tag-${index}-${tagIndex}`}
                          data-tooltip-content={tag}
                        >
                          <FontAwesomeIcon icon={faTag} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  {/* <td><FontAwesomeIcon icon={faClock} /> {problem.timeLimit}s</td> */}
                  <td className={styles[status.toLowerCase().replace(/_/g, '-')]}>
                    {isSolved ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faTimesCircle} />}
                    <span>{getStatusDisplay(status)}</span>
                  </td>
                  <td>{problemPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!showRankings && !isContestOver && !isContestSubmitted && (
        <div className={`${styles.contestButtons} ${styles.centerContent}`}>
          <button onClick={handleSubmitContest} className={styles.submitContestBtn}>
            Submit Contest
          </button>
        </div>
      )}
      
      <AnimatePresence>
        {showRankings && (
          <motion.div 
            className={styles.rankingsSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h2>Contest Rankings</h2>
            <ContestRankingTable 
              contestName={currentContestName}
              participants={participants}
              questions={problems}
              duration={duration}
            />
            <motion.button 
              onClick={navigateToRecentContests} 
              className={styles.navigateButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Recent Contests
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* <motion.div 
        className={styles.ratingSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <FontAwesomeIcon icon={faChartLine} />
        <span>Your new rating: {rating}</span>
      </motion.div> */}

      {problems.map((problem, index) => 
        problem.tags.map((tag, tagIndex) => (
          <Tooltip key={`${index}-${tagIndex}`} id={`tag-${index}-${tagIndex}`} />
        ))
      )}
    </motion.div>
  );
};

export default ContestProblemsTable;
