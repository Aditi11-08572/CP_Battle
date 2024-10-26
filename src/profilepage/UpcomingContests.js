import React, { useEffect, useState } from "react";
import styles from "./UpcomingContests.module.css"; // Import the CSS Module

function UpcomingContests() {
  const [contests, setContests] = useState([]);
  const [pastContests, setPastContests] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch("https://codeforces.com/api/contest.list");
        const data = await response.json();

        if (data.status === "OK") {
          const now = Math.floor(Date.now() / 1000);
          const upcoming = data.result
            .filter((contest) => contest.phase !== "FINISHED" && contest.startTimeSeconds > now)
            .slice(0, 5); // Get top 5 upcoming contests
          const past = data.result
            .filter((contest) => contest.phase === "FINISHED" && contest.startTimeSeconds <= now)
            .slice(0, 5); // Get top 5 past contests

          setContests(upcoming);
          setPastContests(past);
        } else {
          setError("Failed to fetch contests. Please try again later.");
        }
      } catch (error) {
        setError("Error fetching contests: " + error.message);
      } finally {
        setLoading(false); // Set loading to false once data fetching is complete
      }
    };

    fetchContests();
  }, []);

  if (loading) {
    return <div>Loading contests...</div>; // Show loading message
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>; // Show error message if any
  }

  return (
    <div className={styles.upcomingContestsContainer}>
      <h1>Upcoming and Past Contests</h1>

      {/* Upcoming Contests Table */}
      <h2>Upcoming Contests</h2>
      {contests.length > 0 ? (
        <table className={styles.contestsTable}>
          <thead>
            <tr>
              <th>Contest Name</th>
              <th>Start Time</th>
              <th>Phase</th>
            </tr>
          </thead>
          <tbody>
            {contests.map((contest) => (
              <tr key={contest.id}>
                <td>
                  <a
                    href={`https://codeforces.com/contests`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contest.name}
                  </a>
                </td>
                <td>{new Date(contest.startTimeSeconds * 1000).toLocaleString()}</td>
                <td>{contest.phase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No upcoming contests available.</p> // Message when no upcoming contests
      )}

      {/* Past Contests Table */}
      <h2>Past Contests</h2>
      {pastContests.length > 0 ? (
        <table className={styles.contestsTable}>
          <thead>
            <tr>
              <th>Contest Name</th>
              <th>Start Time</th>
              <th>Phase</th>
            </tr>
          </thead>
          <tbody>
            {pastContests.map((contest) => (
              <tr key={contest.id}>
                <td>
                  <a
                    href={`https://codeforces.com/contest/${contest.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contest.name}
                  </a>
                </td>
                <td>{new Date(contest.startTimeSeconds * 1000).toLocaleString()}</td>
                <td>{contest.phase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No past contests available.</p> // Message when no past contests
      )}
    </div>
  );
}

export default UpcomingContests;
