import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ContestRankingTable from './ContestRankingTable';
import styles from './ContestRankingsPage.module.css';

const ContestRankingsPage = () => {
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const { 
    contestName = "Unnamed Contest",
    participants = 0,
    questions = [],
    duration = "N/A",
    contestId
  } = location.state || {};

  console.log("ContestRankingsPage received state:", location.state);
  console.log("Questions received:", questions);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`${styles.rankingsPageContainer} ${isLoaded ? styles.loaded : ''}`}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>{contestName}</h1>
        <div className={styles.contestInfo}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>👥</span>
            <span className={styles.infoText}>{participants}</span>
            <span className={styles.infoLabel}>Participants</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>❓</span>
            <span className={styles.infoText}>
              {Array.isArray(questions) && questions.length > 0 ? questions.length : 'N/A'}
            </span>
            <span className={styles.infoLabel}>Questions</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏱️</span>
            <span className={styles.infoText}>{duration}</span>
            <span className={styles.infoLabel}>Duration</span>
          </div>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        {contestName ? (
          <ContestRankingTable 
            contestName={contestName}
            participants={participants}
            questions={questions}
            duration={duration}
          />
        ) : (
          <p>Contest name is missing. Unable to fetch rankings.</p>
        )}
      </div>
    </div>
  );
};

export default ContestRankingsPage;
