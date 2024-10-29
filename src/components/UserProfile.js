import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ userHandle }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`https://codecraft-contest1.onrender.com/api/users/${userHandle}/profile`);
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userHandle]);

  if (loading) return <div>Loading profile...</div>;
  if (!userProfile) return <div>User not found</div>;

  return (
    <div>
      <h2>{userProfile.userHandle}'s Profile</h2>
      <p>Total Contests: {userProfile.totalContests}</p>
      <p>Average Ranking: {userProfile.averageRanking}</p>
      <h3>Recent Contests</h3>
      <ul>
        {userProfile.recentContests.map(contest => (
          <li key={contest.contestId}>
            {contest.contestName}: Rank {contest.rank}, Points {contest.points}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;
