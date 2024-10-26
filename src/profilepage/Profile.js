import React, { useEffect, useState, useContext } from "react";
import styles from "./Profile.module.css"; // Update import to use CSS Module
import Modal from "./Modal"; // Make sure the path is correct
import { useNavigate } from "react-router-dom";
import { UserContext } from './UserContext';
import axios from 'axios';

function Profile() {
  const { userData, setUserData } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/user/profile/${userEmail}`);
        setUserProfile(response.data);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [navigate, setUserData]);

  const handleEditProfileClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('location', userProfile.location || '');
      formData.append('college', userProfile.college || '');
      formData.append('whatsappNumber', userProfile.whatsappNumber || '');
      formData.append('linkedinUrl', userProfile.linkedinUrl || '');
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      console.log('Sending form data:', Object.fromEntries(formData));

      const response = await axios.put(`http://localhost:5000/api/user/profile/${userProfile.email}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Server response:', response.data);
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUserProfile(updatedUser);
        setUserData(updatedUser);
        closeModal();
      } else {
        console.error('Failed to update profile:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <img 
            src={userProfile?.profile_pic ? `http://localhost:5000${userProfile.profile_pic}` : "/image.png"} 
            alt="Profile" 
          />
        </div>
        <div className={styles.details}>
          <h2 className={styles.un}>{userProfile?.name || "Loading..."}</h2>
          <p className={styles.username}>({userProfile?.codeforcesId || "Not set"})</p>
          <p>Friends: {userProfile?.friends?.length || 0} users</p>
          <p>Location: {userProfile?.location || "Not set"}</p>
          <p>College: {userProfile?.college || "Not set"}</p>
          <p>Codeforces Rating: {userProfile?.codeforcesRating || "Not rated"}</p>
          <p>WhatsApp: {userProfile?.whatsappNumber || "Not set"}</p>
          <p>LinkedIn: {userProfile?.linkedinUrl || "Not set"}</p>
          <button className={styles.editButton} onClick={() => setIsModalOpen(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Recent and Upcoming Contests Section */}
      {/* If you want to keep this section, you'll need to implement the logic to fetch and display contests */}
      {/* For now, let's comment it out to remove the errors */}
      {/*
      <div className={styles.contestsSection}>
        <h2 className={styles.hh2}>Recent and Upcoming Contests</h2>
        <table className={styles.contestsTable}>
          <thead>
            <tr>
              <th className={styles.tbh}>Contest Name</th>
              <th className={styles.tbh}>Start Time</th>
              <th className={styles.tbh}>Phase</th>
            </tr>
          </thead>
          <tbody>
            {contests.map(contest => (
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
        <button className={styles.moreButton} onClick={handleMoreClick}>More</button>
      </div>
      */}

      {isModalOpen && (
        <Modal closeModal={closeModal}>
          <form onSubmit={handleFormSubmit} className={styles.submitForm}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeModal}
            >
              &times;
            </button>
            
            <label>
              Select Profile Image:
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
            {selectedImage && (
              <img 
                src={URL.createObjectURL(selectedImage)} 
                alt="Selected profile" 
                style={{width: '100px', height: '100px', objectFit: 'cover'}} 
              />
            )}
            <label>
              Username:
              <input
                type="text"
                value={userProfile?.name || "Loading..."}
                readOnly
                className={styles.readOnlyInput}
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                value={userProfile?.location || ""}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, location: e.target.value })
                }
              />
            </label>
            <label>
              College:
              <input
                type="text"
                value={userProfile?.college || ""}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, college: e.target.value })
                }
              />
            </label>
            <label>
              WhatsApp Number:
              <input
                type="text"
                value={userProfile?.whatsappNumber || ""}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, whatsappNumber: e.target.value })
                }
              />
            </label>
            <label>
              LinkedIn URL:
              <input
                type="text"
                value={userProfile?.linkedinUrl || ""}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, linkedinUrl: e.target.value })
                }
              />
            </label>
            <button type="submit">Save</button>
          </form>
        </Modal>
      )}

    </div>
  );
}

export default Profile;
