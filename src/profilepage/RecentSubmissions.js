import React, { useEffect, useState } from "react";
import styles from "./RecentSubmissions.module.css"; // Import your CSS module for styling

const RecentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = "tourist"; // Replace with the actual username

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`https://codeforces.com/api/user.status?handle=${username}`);
        const data = await response.json();

        if (data.status === "OK") {
          setSubmissions(data.result);
        } else {
          setError(`Error: ${data.comment}`);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Error fetching submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.maindiv}>
    <div >
      <h2>Recent Submissions for {username}</h2>
      <table className={styles.submissionTable}>
        <thead>
          <tr>
            <th>Submission ID</th> {/* Submission ID in the leftmost column */}
            <th>Problem</th>
            <th>Language</th>
            <th>Verdict</th>
            <th>Time</th>
            <th>Submission Link</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => {
            const problem = submission.problem;
            const submissionId = submission.id; // Submission ID
            const problemLink = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`; // Link to the problem
            const submissionLink = `https://codeforces.com/contest/${problem.contestId}/submission/${submissionId}`; // Link to the submission

            return (
              <tr key={submissionId}>
                <td>{submissionId}</td> {/* Displaying Submission ID */}
                <td>
                  <a href={problemLink} target="_blank" rel="noopener noreferrer">
                    {problem.name}
                  </a>
                </td>
                <td>{submission.programmingLanguage}</td>
                <td style={{ color: submission.verdict === "OK" ? "green" : "red" }}>
                  {submission.verdict}
                </td>
                <td>{(submission.timeConsumedMillis / 1000).toFixed(2)}s</td>
                <td>
                  <a href={submissionLink} target="_blank" rel="noopener noreferrer">
                    View Submission
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default RecentSubmissions;
