import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from './ContestCreationForm.module.css';
import axios from "axios";
import TimerCountdown from './TimerCountdown';

const availableTags = [
  "dp", "greedy", "binary search", "graphs", 
  "strings", "number theory", "combinatorics", "brute force", "2-sat",
  "bitmasks", "chinese remainder theorem", "constructive algorithms",
  "data structures", "dfs and similar", "divide and conquer", "dsu",
  "expression parsing", "fft (fast fourier transform)", "flows", "games",
  "hashing", "implementation", "mathematics", "matrices", "geometry",
  "graph matchings", "interactive", "meet-in-the-middle", "probabilities",
  "schedules", "shortest paths", "sortings", "string suffix structures",
  "ternary search", "trees", "two pointers"
];

const ContestCreationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contestName: "",
    participants: 1,
    questions: 1,
    minRating: 800,
    maxRating: 3000,
    duration: 0.5,
    startDate: new Date(Date.now() + 5 * 60000),
    selectedTags: []
  });
  const [showPopup, setShowPopup] = useState(false);
  const [contestInfo, setContestInfo] = useState(null);
  const [showFriendsPopup, setShowFriendsPopup] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [tagError, setTagError] = useState('');

  const handleContestNameChange = (e) => {
    setFormData({ ...formData, contestName: e.target.value });
  };

  // Function to check if contest name exists in local storage
  const checkContestNameExists = (name) => {
    const existingContests = JSON.parse(localStorage.getItem("recentContests")) || [];
    return existingContests.some(contest => contest.contestName.toLowerCase() === name.toLowerCase());
  };

  // Handle changes for checkboxes (tag selection)
  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      selectedTags: checked
        ? [...prev.selectedTags, value]
        : prev.selectedTags.filter((tag) => tag !== value)
    }));
  };

  // Handle other input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
  
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
  
      // Ensure minRating is less than or equal to maxRating
      if (name === "minRating" && parseInt(value) > parseInt(prev.maxRating)) {
        updatedFormData.maxRating = value;
      } else if (name === "maxRating" && parseInt(value) < parseInt(prev.minRating)) {
        updatedFormData.minRating = value;
      }
  
      return updatedFormData;
    });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, startDate: date });
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await axios.get(`https://codecraft-contest1.onrender.com/api/users/${userEmail}/friends`);
        console.log('Fetched friends:', response.data); // Add this log
        setFriends(response.data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTagError('');

    if (formData.selectedTags.length < 3) {
      setTagError('Please select at least 3 question tags.');
      return;
    }

    if (contestInfo) {
      setShowPopup(true);
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        console.error('User email is not set in localStorage');
        alert('Please log in again to create a contest.');
        navigate('/login'); // Redirect to login page
        return;
      }

      const payload = {
        userEmail,
        contestName: formData.contestName,
        participants: parseInt(formData.participants),
        questions: parseInt(formData.questions),
        minRating: parseInt(formData.minRating),
        maxRating: parseInt(formData.maxRating),
        duration: formData.duration,
        startDate: formData.startDate.toISOString(),
        selectedTags: formData.selectedTags
      };

      console.log('Payload:', payload);

      const response = await axios.post('https://codecraft-contest1.onrender.com/api/contests', payload);

      if (response.status === 201) {
        setContestInfo(response.data);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      alert('Failed to create contest. Please try again.');
    }
  };

  const handleCopyCode = () => {
    if (contestInfo) {
      navigator.clipboard.writeText(contestInfo.contestCode);
      alert('Contest code copied to clipboard!');
    }
  };

  const handleAddFriends = () => {
    setShowFriendsPopup(true);
  };

  const handleFriendSelection = (friendEmail) => {
    setSelectedFriends(prev => 
      prev.includes(friendEmail) 
        ? prev.filter(email => email !== friendEmail)
        : [...prev, friendEmail]
    );
  };

  const handleInviteFriends = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const payload = {
        senderEmail: userEmail,
        invitedFriends: selectedFriends, // This should be an array of user IDs
        contestCode: contestInfo.contestCode,
        contestName: contestInfo.contestName
      };
      console.log('Sending invite payload:', payload);
      
      const response = await axios.post('https://codecraft-contest1.onrender.com/api/contests/invite', payload);
      console.log('Invite response:', response.data);

      alert('Friends invited successfully!');
      setShowFriendsPopup(false);
    } catch (error) {
      console.error('Error inviting friends:', error.response?.data || error);
      alert('Failed to invite friends. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.formTitle}>Custom Contest Creation</h1>
  
        <div className={styles.formGroup}>
          {/* <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="generateFrom"
                value="codeforces"
                checked={formData.generateFrom === "codeforces"}
                onChange={handleInputChange}
              />
              Codeforces
            </label>
  
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="generateFrom"
                value="ai"
                checked={formData.generateFrom === "ai"}
                onChange={handleInputChange}
              />
              AI
            </label>
          </div> */}
        </div>
  
        <div className={styles.formGroup}>
          <label className={styles.label01}><h2>Contest Name:</h2></label>
          <input
            type="text"
            className={styles.inputField}
            value={formData.contestName}
            onChange={handleContestNameChange}
            required
          />
        </div>
  
        {/* <div className={styles.formGroup}>
          <label className={styles.label01}><h2>Number of Participants (1 to 10):</h2></label>
          <input
            className={styles.inputField}
            type="number"
            name="participants"
            min="1"
            max="10"
            value={formData.participants}
            onChange={handleInputChange}
            required
          />
        </div> */}
  
        <div className={styles.formGroup}>
          <label className={styles.label01}><h2>Number of Questions :</h2></label>
          <input
            className={styles.inputField}
            type="number"
            name="questions"
            min="1"
            max="10"
            value={formData.questions}
            onChange={handleInputChange}
            required
          />
        </div>
  
        <div className={styles.formGroup}>
          <label className={styles.label01}><h2>Minimum Rating:</h2></label>
          <input
            className={styles.inputField}
            type="number"
            name="minRating"
            min="800"
            max="3000"
            step="100"
            value={formData.minRating}
            onChange={handleInputChange}
            required
          />
        </div>
  
        <div className={styles.formGroup}>
          <label className={styles.label01}><h2>Maximum Rating:</h2></label>
          <input
            className={styles.inputField}
            type="number"
            name="maxRating"
            min="800"
            max="3000"
            step="100"
            value={formData.maxRating}
            onChange={handleInputChange}
            required
          />
        </div>
  
        <div className={styles.formGroup}>
          <label className={styles.label01}><h2>Contest Duration:</h2></label>
          <select
            className={styles.inputField}
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
          >
            <option value="0.5">0.5 hr</option>
            <option value="1">1 hr</option>
            <option value="1.5">1.5 hrs</option>
            <option value="2">2 hrs</option>
            <option value="2.5">2.5 hrs</option>
            <option value="3">3 hrs</option>
            <option value="3.5">3.5 hrs</option>
            <option value="4">4 hrs</option>
            <option value="4.5">4.5 hrs</option>
            <option value="5">5 hrs</option>
          </select>
        </div>
  
        <div>
          <label className={styles.label1}>Start Date and Time:</label>
          <DatePicker
            className={styles.DatePicker01}
            selected={formData.startDate}
            onChange={handleDateChange}
            showTimeSelect
            timeIntervals={1}
            dateFormat="Pp"
            timeCaption="Time"
            minDate={new Date()}
          />
        </div>
  
        <div className={styles.formGroup}>
          <label className={styles.label1}><h2>Select Question Tags (at least 3):</h2></label>
          <div className={styles.tagsGrid}>
            {availableTags.map((tag) => (
              <label key={tag} className={styles.tagLabel}>
                <input
                  type="checkbox"
                  value={tag}
                  checked={formData.selectedTags.includes(tag)}
                  onChange={handleTagChange}
                />
                <div className={styles.checkbox01}>{tag}</div>
              </label>
            ))}
          </div>
          {tagError && <p className={styles.errorMessage}>{tagError}</p>}
        </div>
         <div className={styles.ccb}>
        <button type="submit" className={styles.submitButton}>
          Create Contest
        </button>
        </div>

        {showPopup && contestInfo && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>Congratulations!</h2>
              <p>Your contest has been created.</p>
              <div className={styles.contestCodeContainer}>
                <span>Contest Code:</span>
                <strong className={styles.contestCode}>{contestInfo.contestCode}</strong>
              </div>
              <div className={styles.timerContainer}>
                <TimerCountdown startTime={formData.startDate} />
              </div>
              <div className={styles.popupButtons}>
                <button onClick={handleCopyCode} className={styles.copyButton}>Copy Code</button>
                <button onClick={handleAddFriends} className={styles.addFriendsButton}>Add Friends to Contest</button>
              </div>
              <button onClick={() => setShowPopup(false)} className={styles.closeButton}>Close</button>
            </div>
          </div>
        )}

        {showFriendsPopup && (
          <div className={styles.inviteFriendsOverlay}>
            <div className={styles.inviteFriendsPopup}>
              <h3>Select Friends to Invite</h3>
              <div className={styles.inviteFriendsList}>
                {friends.map(friend => (
                  <div key={friend._id} className={styles.inviteFriendItem}>
                    <input
                      type="checkbox"
                      id={friend._id}
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleFriendSelection(friend._id)}
                    />
                    <label htmlFor={friend._id}>{friend.name || friend.email}</label>
                  </div>
                ))}
              </div>
              <div className={styles.invitePopupButtons}>
                <button onClick={handleInviteFriends} className={styles.inviteButton}>Invite Selected Friends</button>
                <button onClick={() => setShowFriendsPopup(false)} className={styles.inviteCloseButton}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContestCreationForm;
