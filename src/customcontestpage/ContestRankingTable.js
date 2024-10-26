import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
import styles from './ContestRankingTable.module.css';

const ContestRankingTable = ({ contestName, questions = [] }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'totalPoints', direction: 'descending' });
  const ITEMS_PER_PAGE = 5; // Define this constant for items per page

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/contests/${encodeURIComponent(contestName)}/rankings`, {
        params: { page: currentPage, limit: ITEMS_PER_PAGE }
      });
      
      setRankings(response.data.rankings);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError('Failed to fetch rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [contestName, currentPage]);

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socket.emit('joinContest', contestName);
    
    socket.on('rankingsUpdate', ({ contestName: updatedContestName }) => {
      if (updatedContestName === contestName) {
        fetchRankings();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [contestName]);

  const sortedRankings = React.useMemo(() => {
    let sortableItems = [...rankings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [rankings, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  if (loading) return <div>Loading rankings...</div>;
  if (error) return <div>Error: {error}</div>;
  if (rankings.length === 0) return <div>No rankings available for this contest.</div>;

  return (
    <div className={styles.rankingContainer}>
      <table className={styles.rankingTable}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th onClick={() => requestSort('totalPoints')}>Total Score</th>
            <th onClick={() => requestSort('finishTime')}>Finish Time</th>
            {Array.isArray(questions) && questions.map((_, i) => (
              <th key={i}>Q{i + 1} Points</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRankings.map((user, index) => {
            const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
            return (
              <tr key={user.userHandle} className={`${styles.rankingRow} ${rank <= 3 ? styles.topRank : ''}`}>
                <td>{rank}</td>
                <td>{user.userHandle}</td>
                <td>{user.totalPoints}</td>
                <td>{new Date(user.finishTime).toLocaleTimeString()}</td>
                {Array.isArray(questions) && questions.map((q, qIndex) => (
                  <td key={qIndex}>
                    {user.questionPoints[`${q.contestId}-${q.index}`] || 0}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.pagination}>
        <button 
          className={styles.paginationButton}
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className={styles.paginationInfo}>{currentPage} / {totalPages}</span>
        <button 
          className={styles.paginationButton}
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ContestRankingTable;
