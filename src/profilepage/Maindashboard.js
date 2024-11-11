import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Add this import
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import styles from './Maindashboard.module.css';
import axios from 'axios';
import { FaBell, FaSignOutAlt, FaTimes, FaClock, FaUser, FaTrashAlt } from 'react-icons/fa'; // Import bell, sign out, and times icons
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import Navbar from './Navbar';
// import { toast } from 'react-toastify';

const Mainboard = () => {
 
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  // New state for notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [contestCode, setContestCode] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [registeredContests, setRegisteredContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(0);
  const [ongoingContests, setOngoingContests] = useState([]);
  const [pastContests, setPastContests] = useState([
    { id: 1, name: "Codeforces Round #788", date: "2023-06-10", time: "17:35" },
    { id: 2, name: "Educational Codeforces Round 149", date: "2023-06-05", time: "14:35" },
    { id: 3, name: "Codeforces Round #787", date: "2023-06-01", time: "19:35" },
  ]);
  const [regularContests, setRegularContests] = useState([]);

  useEffect(() => {
    fetchNotifications();
    // Set up a timer to fetch notifications periodically
    const timer = setInterval(fetchNotifications, 60000); // Fetch every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('Component updated, registered contests:', registeredContests);
  }, [registeredContests]);

  useEffect(() => {
    fetchRegisteredContests();
  }, [triggerFetch]);

  useEffect(() => {
    fetchOngoingContests();
  }, []);

  useEffect(() => {
    fetchPastContests();
  }, []);

  useEffect(() => {
    fetchCodeforcesContests();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('User email not found in localStorage');
        // Handle this case, perhaps by redirecting to login
        return;
      }
      console.log('Fetching notifications for:', userEmail);
      const response = await axios.get(`http://localhost:5000/api/notifications/${userEmail}`);
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCreateContest = () => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate('/create-contest');
    }, 500);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      await axios.post(`http://localhost:5000/api/notifications/${userEmail}/mark-read`);
      setUnreadCount(0);
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Add 'removing' class to start the slide-out animation
      const notificationElement = document.getElementById(`notification-${notificationId}`);
      if (notificationElement) {
        notificationElement.classList.add(styles.removing);
      }

      // Wait for the animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));

      await axios.delete(`http://localhost:5000/api/notifications/${notificationId}`);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Optionally, show an error message to the user
    }
  };
const copyToClipboard = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    // Add toast notification
    toast.success('Contest code copied to clipboard!', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      style: {
        background: '#4CAF50',
        color: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }
    });
    console.log('Contest code copied to clipboard:', code);
  } catch (err) {
    console.error('Failed to copy code:', err);
    toast.error('Failed to copy code', {
      position: "top-right",
      autoClose: 2000,
      theme: "light"
    });
  }
};
  // Sample contest data
  // const regularContests = [
  //   { id: 1, name: "Codeforces Round #789", date: "2023-06-15", time: "17:35" },
  //   { id: 2, name: "Educational Codeforces Round 150", date: "2023-06-18", time: "14:35" },
  //   { id: 3, name: "Codeforces Round #790", date: "2023-06-20", time: "19:35" },
  // ];

  const upcomingContests = [
    { id: 1, name: "Codeforces Round #791 (Div. 2)", date: "2023-06-25", time: "15:35" },
    { id: 2, name: "Educational Codeforces Round 151", date: "2023-06-28", time: "14:35" },
  ];

  // Add this helper function to get initials from email
  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return 'U';
    if (nameOrEmail.includes('@')) {
      // It's an email
      return nameOrEmail.split('@')[0].charAt(0).toUpperCase();
    } else {
      // It's a name
      return nameOrEmail.split(' ').map(n => n[0]).join('').toUpperCase();
    }
  };

  const formatMessage = (message) => {
    const sanitizedMessage = DOMPurify.sanitize(message);
    return sanitizedMessage.replace(
      /\(Code: (.+?)\)/,
      '(Code: <span class="' + styles.contestCode + '">$1</span>)'
    );
  };

  const handleJoinContestClick = () => {
    setShowJoinPopup(true);
  };

  const handleJoinContest = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      console.log(`Attempting to join contest ${contestCode} for user ${userEmail}`);
      
      const response = await axios.get(`http://localhost:5000/api/contests/${contestCode}/check-invitation`, {
        params: { userEmail }
      });
      
      console.log('Server response:', response.data);

      if (response.data.success) {
        if (response.data.isInvited) {
          console.log(`User is invited. Navigating to contest: ${contestCode}`);
          setJoinMessage('You are invited! Redirecting...');
          navigate(`/contest-info/${contestCode}`);
        } else {
          console.log('User is not invited to this contest.');
          setJoinMessage('You are not invited to this contest.');
        }
      } else {
        console.log('Error checking invitation.');
        setJoinMessage(response.data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Error joining contest:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      setJoinMessage('An error occurred. Please try again.');
    }
  };

  const fetchRegisteredContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem('userEmail');
      console.log('Fetching contests for user:', userEmail);
      const response = await axios.get(`http://localhost:5000/api/user-contests`, {
        params: { userEmail }
      });
      console.log('Fetched contests:', response.data);
      setRegisteredContests(response.data);
    } catch (error) {
      console.error('Error fetching registered contests:', error);
      setError('Failed to fetch contests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOngoingContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found in localStorage');
      }
      const response = await axios.get(`http://localhost:5000/api/ongoing-contests`, {
        params: { userEmail }
      });
      setOngoingContests(response.data);
    } catch (error) {
      console.error('Error fetching ongoing contests:', error);
      setError(`Failed to fetch ongoing contests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem('userEmail');
      const response = await axios.get(`http://localhost:5000/api/past-contests`, {
        params: { userEmail }
      });
      setPastContests(response.data);
    } catch (error) {
      console.error('Error fetching past contests:', error);
      setError('Failed to fetch past contests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCodeforcesContests = async () => {
    try {
      const response = await axios.get('https://codeforces.com/api/contest.list');
      if (response.data.status === 'OK') {
        const now = Date.now();
        const upcomingContests = response.data.result
          .filter(contest => contest.phase === 'BEFORE' && contest.startTimeSeconds * 1000 > now)
          .map(contest => ({
            id: contest.id,
            name: contest.name,
            startTime: contest.startTimeSeconds * 1000,
            date: new Date(contest.startTimeSeconds * 1000).toLocaleDateString(),
            time: new Date(contest.startTimeSeconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          .sort((a, b) => a.startTime - b.startTime)
          .slice(0, 3);  // Get only the first 3 upcoming contests after sorting
        setRegularContests(upcomingContests);
      }
    } catch (error) {
      console.error('Error fetching Codeforces contests:', error);
      // Optionally set an error state here
    }
  };

  const handleViewContest = (contestId) => {
    navigate(`/contest-info/${contestId}`);
  };

  const handleEnterContest = (contestId) => {
    // Navigate to contest page
    navigate(`/contest/${contestId}`);
  };

  // Limit pastContests to 4 items
  const limitedPastContests = pastContests.slice(0, 4);

  const handleMoreClick = () => {
    navigate('/all-past-contests');
  };

  return (
    <>
       <Navbar/>
      {isNavigating && <Spinner />}
      <div className={`${styles.mainboardContainer} ${isNavigating ? styles.navigatingOut : ''}`}>
        <div className={styles.navbar}>
          <div className={styles.navLeft}>
            <h1 className={styles.header01}>Contests </h1>
          </div>
          <div className={styles.navRight}>
            <button onClick={handleCreateContest} className={styles.createContestButton}>
              Create Contest
            </button>
            <button onClick={handleJoinContestClick} className={styles.joinContestButton}>
              Join via Code
            </button>
            <div className={styles.notificationIcon} onClick={toggleNotifications}>
              <FaBell />
              {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
            </div>
            {/* <button onClick={handleLogout} className={styles.logoutButton}>
              <FaSignOutAlt />
            </button> */}
          </div>
        </div>
        
        {/* Add notification menu */}
        {showNotifications && (
          <div className={styles.notificationMenu}>
            <div className={styles.notificationsPanel}>
              <div className={styles.notificationsHeader}>
                <h3>Notifications</h3>
                <button className={styles.closeButton} onClick={toggleNotifications}>
                  <FaTimes />
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className={styles.noNotifications}>You're all caught up!</p>
              ) : (
                <ul className={styles.notificationList}>
                  {notifications.map((notification) => (
                    <li 
                      key={notification._id} 
                      className={styles.notificationItem}
                    >
                      <div className={styles.notificationContent}>
                        <div className={styles.notificationHeader}>
                          <div className={styles.profilePhoto}>
                            {getInitials(notification.senderName || notification.senderEmail || 'U')}
                          </div>
                          <div className={styles.notificationMessage}>
                            {notification.senderName || 
                              notification.senderEmail} has invited you to join the contest
                          </div>
                        </div>
                        <div className={styles.contestInfo}>
                          <div className={styles.contestCode}>
                            Code: <span>{notification.contestCode}</span>
                          </div>
                        </div>
                        <div className={styles.notificationFooter}>
                          <div className={styles.notificationTime}>
                            <FaClock /> {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </div>
                          <button onClick={() => copyToClipboard(notification.contestCode)} className={styles.joinContestButton}>
                            COPY CODE
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        <div className={styles.contestsGrid}>
          <div className={styles.contestSection}>
            <h2 className={styles.sectionTitle}>UPCOMING CODEFORCES CONTESTS</h2>
            <table className={styles.contestTable}>
              <thead>
                <tr>
                  <th>CONTEST NAME</th>
                  <th>DATE</th>
                  <th>TIME</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {regularContests.map((contest) => (
                  <tr key={contest.id}>
                    <td>
                      <a href={`https://codeforces.com/contests/${contest.id}`} target="_blank" rel="noopener noreferrer" className={styles.contestName}>
                        {contest.name}
                      </a>
                    </td>
                    <td className={styles.date}>{contest.date}</td>
                    <td className={styles.time}>{contest.time}</td>
                    <td>
                      <a href={`https://codeforces.com/contests/${contest.id}`} target="_blank" rel="noopener noreferrer" className={styles.viewButton}>
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={styles.contestColumn}>
            <h2 className={styles.heading}>Ongoing Custom Contests</h2>
            <div className={styles.tableContainer}>
              {loading ? (
                <p>Loading contests...</p>
              ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
              ) : ongoingContests.length > 0 ? (
                <table className={styles.contestTable}>
                  <thead>
                    <tr>
                      <th>NAME</th>
                      <th>START TIME</th>
                      <th>DURATION</th>
                      <th>ENTER</th>
                      {/* <th>ENTER</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {ongoingContests.map(contest => (
                      <tr key={contest._id}>
                        <td className={styles.contestName}>{contest.contestName}</td>
                        <td>{new Date(contest.startDate).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                        <td>{contest.duration}</td>
                        <td>
                          <button className={styles.viewButton} onClick={() => handleViewContest(contest.contestCode)}>Enter </button>
                        </td>
                        {/* <td>
                          <button className={styles.enterButton} onClick={() => handleEnterContest(contest.contestCode)}>View </button>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No ongoing contests found.</p>
              )}
            </div>
            {/* <button className={styles.moreButton}>More</button> */}
          </div>
          
          <div className={styles.contestColumn}>
            <h2 className={styles.heading}>Upcoming Custom Contests</h2>
            {loading ? (
              <p>Loading contests...</p>
            ) : error ? (
              <p className={styles.errorMessage}>{error}</p>
            ) : registeredContests.length > 0 ? (
              <table className={styles.contestTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>View</th>
                    {/* <th>Join</th> */}
                  </tr>
                </thead>
                <tbody>
                  {registeredContests.map(contest => (
                    <tr key={contest._id}>
                      <td className={styles.contestName}>{contest.contestName}</td>
                      <td>{new Date(contest.startDate).toLocaleDateString()}</td>
                      <td>{new Date(contest.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <button className={styles.viewButton} onClick={() => handleViewContest(contest.contestCode)}>View</button>
                      </td>
                      {/* <td>
                        <button onClick={() => handleJoinContest(contest.contestCode)}>Join</button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No upcoming contests found.</p>
            )}
            {/* <button className={styles.button123}>More</button> */}
          </div>
        </div>
        
        <div className={styles.pastContests}>
          <h2 className={styles.heading}>Past Contests</h2>
          <div className={styles.tableContainer}>
            {loading ? (
              <p>Loading contests...</p>
            ) : error ? (
              <p className={styles.errorMessage}>{error}</p>
            ) : limitedPastContests.length > 0 ? (
              <table className={styles.contestTable}>
                <thead>
                  <tr>
                    <th>CONTEST NAME</th>
                    <th>DATE</th>
                    <th>TIME</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {limitedPastContests.map(contest => (
                    <tr key={contest.id || contest._id}>
                      <td className={styles.contestName}>{contest.name || contest.contestName}</td>
                      <td>{contest.date || new Date(contest.startDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</td>
                      <td>{contest.time || new Date(contest.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                      <td>
                        <button className={styles.viewButton} onClick={() => handleViewContest(contest.id || contest.contestCode)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No past contests found.</p>
            )}
          </div>
          <button className={styles.moreButton} onClick={handleMoreClick}>More</button>
        </div>
      </div>
      {showJoinPopup && (
        <div className={styles.popupOverlay} onClick={() => setShowJoinPopup(false)}>
          <div className={`${styles.popup} ${styles.fadeInUp}`} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.popupTitle}>Join Contest</h2>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Enter contest code"
                value={contestCode}
                onChange={(e) => setContestCode(e.target.value)}
                className={styles.popupInput}
              />
              <span className={styles.inputFocus}></span>
            </div>
            <div className={styles.popupButtons}>
              <button onClick={handleJoinContest} className={`${styles.popupButton} ${styles.joinButton}`}>
                <span className={styles.buttonText}>Join Contest</span>
                <span className={styles.buttonIcon}>→</span>
              </button>
              <button onClick={() => setShowJoinPopup(false)} className={`${styles.popupButton} ${styles.cancelButton}`}>
                Cancel
              </button>
            </div>
            {joinMessage && <p className={`${styles.joinMessage} ${styles.fadeIn}`}>{joinMessage}</p>}
          </div>
        </div>
      )}
      {/* <button onClick={() => setTriggerFetch(prev => prev + 1)}>Refresh Contests</button> */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default Mainboard;
