import React, { useState, useEffect } from "react";
import styles from "./RecentContest.module.css"; // Import the CSS Module
import axios from 'axios';

const RecentContest = () => {
    const [contests, setContests] = useState([]);
    const [userSubmissions, setUserSubmissions] = useState(new Set()); // Initialize as a Set
    const userHandle = "YOUR_USER_HANDLE"; // Replace with the actual user handle
  
    useEffect(() => {
      // Fetch the contest data from localStorage
      const storedContests = JSON.parse(localStorage.getItem("recentContests")) || [];
      setContests(storedContests);
  
      // Fetch user submission data
      const fetchUserSubmissions = async () => {
        try {
          const response = await axios.get(`https://codeforces.com/api/user.status?handle=${userHandle}`);
          const submissions = response.data.result || [];
          const solvedProblems = new Set();
  
          // Iterate through submissions to collect solved problems
          submissions.forEach(submission => {
            if (submission.verdict === 'OK') {
              solvedProblems.add(submission.problem.name); // Use the problem name
            }
          });
  
          // Store solved problems in state
          setUserSubmissions(solvedProblems);
        } catch (error) {
          console.error("Error fetching user submissions:", error);
        }
      };
  
      fetchUserSubmissions();
    }, [userHandle]);
  
    const handleDelete = (index) => {
      const updatedContests = contests.filter((_, i) => i !== index);
      setContests(updatedContests);
      localStorage.setItem("recentContests", JSON.stringify(updatedContests));
    };
  
    const countSolvedQuestions = (questions) => {
      return Array.isArray(questions) ? questions.filter(question => userSubmissions.has(question.name)).length : 0;
    };
  
    return (
      <div className={styles.recentContestsContainer}>
        <h1>Recent Contests</h1>
        {contests.length === 0 ? (
          <p>No recent contests available.</p>
        ) : (
          <table className={styles.recentContestsTable}>
            <thead>
              <tr>
                <th>Contest Name</th>
                <th>Start Time</th>
                <th>Duration (hours)</th>
                <th>Solved Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest, index) => (
                <tr key={index}>
                  <td>{contest.contestName}</td>
                  <td>{contest.startTime}</td>
                  <td>{contest.duration}</td>
                  <td>{countSolvedQuestions(contest.questions)}</td> {/* Show number of solved questions */}
                  <td>
                    <button onClick={() => handleDelete(index)}>Delete</button>
                    <details>
                      <summary>Show Questions</summary>
                      <ul>
                        {Array.isArray(contest.questions) ? (
                          contest.questions.map((question, qIndex) => (
                            <li key={qIndex}>
                              <a
                                href={`https://codeforces.com/problemset/problem/${question.contestId}/${question.index}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {question.name} (Rating: {question.rating})
                              </a>
                            </li>
                          ))
                        ) : (
                          <li>No questions available</li>
                        )}
                      </ul>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
};
  
export default RecentContest;
