import React from "react";
import styles from "./Discussion.module.css";  // Import the CSS module

const Discussion = () => {
  return (
    <div className={styles.discussionContainer}>
      <h2>Discussions</h2>
      <div className={styles.discussionComment}>
        <p>
          <strong>user123:</strong> Does anyone have a solution to problem D from the last round?
        </p>
        <p className={styles.commentTime}>Posted on 2024-09-28 14:32</p>
      </div>
      <div className={styles.discussionComment}>
        <p>
          <strong>coder99:</strong> I think the solution involves dynamic programming. Try breaking the problem down into subproblems.
        </p>
        <p className={styles.commentTime}>Posted on 2024-09-28 15:10</p>
      </div>
      <div className={styles.discussionComment}>
        <p>
          <strong>competitiveGenius:</strong> Problem D is actually solvable with greedy algorithms if you optimize the first step!
        </p>
        <p className={styles.commentTime}>Posted on 2024-09-28 16:00</p>
      </div>
    </div>
  );
};

export default Discussion;
