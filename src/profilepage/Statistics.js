import React, { useEffect, useState } from "react";
import ProblemsSolved from "./ProblemsSolved";
import RatingsGraph from "./RatingsGraph";
import styles from "./Statistics.module.css"; // Import the CSS Module
import axios from 'axios';

function Statistics() {
  const [problemCounts, setProblemCounts] = useState({ easy: 0, medium: 0, hard: 0 });
  const [codeforcesId, setCodeforcesId] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch the user's data from your backend
        const userEmail = localStorage.getItem('userEmail');
        const response = await axios.get(`http://localhost:5000/api/user/profile/${userEmail}`);
        const userData = response.data;
        setCodeforcesId(userData.codeforcesId);

        // Now fetch Codeforces data using the retrieved codeforcesId
        if (userData.codeforcesId) {
          const cfResponse = await fetch(`https://codeforces.com/api/user.status?handle=${userData.codeforcesId}`);
          const cfData = await cfResponse.json();

          if (cfData.status === "OK") {
            const problemData = cfData.result;
            const counts = { easy: 0, medium: 0, hard: 0 };
            const solvedProblems = new Set();

            problemData.forEach((problem) => {
              if (problem.verdict === "OK") {
                const rating = problem.problem.rating;
                const problemId = problem.problem.name;

                if (!solvedProblems.has(problemId)) {
                  solvedProblems.add(problemId);

                  if (rating <= 1200) {
                    counts.easy++;
                  } else if (rating <= 1700) {
                    counts.medium++;
                  } else if (rating >= 1900) {
                    counts.hard++;
                  }
                }
              }
            });

            setProblemCounts(counts);
          } else {
            console.error("Failed to fetch Codeforces data:", cfData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className={styles.statistics}>
      <div className={styles.problemsAndRatings}>
        <ProblemsSolved 
          totalProblems={problemCounts.easy + problemCounts.medium + problemCounts.hard} 
          easy={problemCounts.easy} 
          medium={problemCounts.medium} 
          hard={problemCounts.hard} 
        />
        <RatingsGraph className={styles.rg}
          easy={problemCounts.easy} 
          medium={problemCounts.medium} 
          hard={problemCounts.hard} 
        />
      </div>
    </div>
  );
}

export default Statistics;
