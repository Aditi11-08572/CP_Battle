import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "./RecentActivity.module.css"; // Importing the CSS Module

function RecentActivity() {
  const navigate = useNavigate(); // Initialize navigate

  const handleMoreClick = () => {
    navigate("/discussions"); // Navigate to the discussions page
  };

  return (
    <div className={styles.recentActivity}>
      {/* Recent Contests Section */}
      {/* <div className={`${styles.recent} ${styles.recentContests}`}>
        <h3>Recent Contests</h3>
        <table className={styles.recentTable}>
          <thead>
            <tr className={styles.tableRow}>
              <th>Contest</th>
              <th>Date</th>
              <th>Rank</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className={styles.tableRow}>
              <td className={styles.link}><a href="#contest1">Codeforces Round #789</a></td>
              <td>2024-09-28</td>
              <td>150</td>
              <td>2200</td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.link}><a href="#contest2">Codeforces Round #788</a></td>
              <td>2024-09-24</td>
              <td>320</td>
              <td>1900</td>
            </tr>
            <tr className={styles.tableRow}>
              <td className={styles.link}><a href="#contest3">Codeforces Round #787</a></td>
              <td>2024-09-21</td>
              <td>80</td>
              <td>2400</td>
            </tr>
          </tbody>
        </table>
        <button className={styles.moreButton}
        onClick={() => navigate("/recent-contests")}
        >More</button>
      </div> */}

      {/* Recent Submissions Section */}
      {/* <div className={`${styles.recent} ${styles.recentSubmissions}`}>
        <h3>Recent Submissions</h3>
        <table className={styles.recentTable}>
          <thead>
            <tr>
              <th className={styles.tableRow}>Problem</th>
              <th className={styles.tableRow}>Language</th>
              <th className={styles.tableRow}>Verdict</th>
              <th className={styles.tableRow}>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td ><a href="#submission1">A. Two Sum</a></td>
              <td>C++</td>
              <td style={{ color: "green" }}>Accepted</td>
              <td>1.2s</td>
            </tr>
            <tr>
              <td><a href="#submission2">B. Maximum Subarray</a></td>
              <td>Python</td>
              <td style={{ color: "red" }}>Wrong Answer</td>
              <td>0.8s</td>
            </tr>
            <tr>
              <td><a href="#submission3">C. Longest Path</a></td>
              <td>Java</td>
              <td style={{ color: "green" }}>Accepted</td>
              <td>2.5s</td>
            </tr>
          </tbody>
        </table>
        <button
  className={styles.moreButton}
  onClick={() => navigate("/recent-submissions")} // Navigate to RecentSubmissions page
>
  More
</button>
      </div> */}

      {/* Discussions Section */}
      {/* <div className={`${styles.recent} ${styles.discussions}`}>
        <h3>Discussions</h3>
        <div className={styles.discussionComment}>
          <p><strong>user123:</strong> Does anyone have a solution to problem D from the last round?</p>
          <p className={styles.commentTime}>Posted on 2024-09-28 14:32</p>
        </div>
        <div className={styles.discussionComment}>
          <p><strong>coder99:</strong> I think the solution involves dynamic programming. Try breaking the problem down into subproblems.</p>
          <p className={styles.commentTime}>Posted on 2024-09-28 15:10</p>
        </div>
        <div className={styles.discussionComment}>
          <p><strong>competitiveGenius:</strong> Problem D is actually solvable with greedy algorithms if you optimize the first step!</p>
          <p className={styles.commentTime}>Posted on 2024-09-28 16:00</p>
        </div>
        <button className={styles.moreButton} onClick={handleMoreClick}>More</button>
      </div>*/}
    </div> 
  );
}

export default RecentActivity;
