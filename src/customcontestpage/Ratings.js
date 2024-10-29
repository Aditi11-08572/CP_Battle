import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from './Ratings.module.css'; // Importing the module CSS

const UserRating = ({ userHandle, problemsSolved }) => {
  const [finalRating, setFinalRating] = useState(1500); // Default starting rating
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateRating = async () => {
      try {
        // Fetch current rating from the database
        const response = await axios.get(`https://codecraft-contest1.onrender.com/api/rating/${userHandle}`);
        const currentRating = response.data.rating;

        // Calculate new rating based on problems solved
        const updatedRating = calculateNewRating(currentRating, problemsSolved);

        // Update the user's rating in the database
        await axios.put(`https://codecraft-contest1.onrender.com/api/rating/${userHandle}`, {
          newRating: updatedRating,
        });

        setFinalRating(updatedRating);
        setMessage(`User rating updated successfully to ${updatedRating}`);
      } catch (error) {
        if (error.response) {
          setMessage("Error: " + error.response.data.message);
        } else {
          setMessage("Error updating user rating: " + error.message);
        }
      }
    };

    // Call the function to update the rating
    updateRating();
  }, [userHandle, problemsSolved]);

  const calculateNewRating = (currentRating, problemsSolved) => {
    let ratingChange = 0;

    problemsSolved.forEach((problem) => {
      // Implement your logic here for how each problem affects the rating
      ratingChange += problem.rating; // Or any other formula you want to apply
    });

    return Math.max(currentRating + ratingChange, 1500); // Ensure rating doesn't drop below 1500
  };

  return (
    <div className={styles.ratingsContainer}> {/* Use CSS Module class */}
      <h2 className={styles.title}>Your Final Rating: {finalRating}</h2> {/* Apply styles */}
      {message && <div className={styles.message}>{message}</div>} {/* Apply styles */}
    </div>
  );
};

export default UserRating;
