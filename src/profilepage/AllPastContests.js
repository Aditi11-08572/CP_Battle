import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Maindashboard.module.css';
import { useNavigate } from 'react-router-dom';

const AllPastContests = () => {
  const [pastContests, setPastContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPastContests();
  }, []);

  const fetchAllPastContests = async () => {
    try {
      setLoading(true);
      setError(null);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found in localStorage');
      }
      const response = await axios.get(`http://localhost:5000/api/all-past-contests`, {
        params: { userEmail }
      });
      setPastContests(response.data);
    } catch (error) {
      console.error('Error fetching all past contests:', error);
      setError(`Failed to fetch all past contests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContest = (contestId) => {
    navigate(`/contest-info/${contestId}`);
  };

  return (
    <div className={styles.allPastContests}>
      <h2 className={styles.heading}>All Past Contests</h2>
      <div className={styles.tableContainer}>
        {loading ? (
          <p>Loading contests...</p>
        ) : error ? (
          <p className={styles.errorMessage}>{error}</p>
        ) : pastContests.length > 0 ? (
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
              {pastContests.map(contest => (
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
    </div>
  );
};

export default AllPastContests;
