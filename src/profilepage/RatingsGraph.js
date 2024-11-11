import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush
} from 'recharts';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import styles from './RatingsGraph.module.css'; // Importing the RatingsGraph.module.css for styling

function RatingsGraph() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatingHistory = async () => {
      try {
        // First, fetch the user's Codeforces ID from your backend
        const userEmail = localStorage.getItem('userEmail');
        const userResponse = await axios.get(`https://cp-battle.onrender.com/api/user/profile/${userEmail}`);
        const codeforcesId = userResponse.data.codeforcesId;

        if (!codeforcesId) {
          setError('Codeforces ID not set for this user.');
          setLoading(false);
          return;
        }

        // Then, fetch the rating history from Codeforces API
        const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${codeforcesId}`);
        if (response.data.status === 'OK') {
          const ratingHistory = response.data.result.map(contest => ({
            date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'yyyy-MM-dd'),
            rating: contest.newRating
          }));
          setData(ratingHistory);
        } else {
          setError('Failed to fetch rating history from Codeforces.');
        }
      } catch (err) {
        setError('An error occurred while fetching the rating history.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchRatingHistory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title01}>Codeforces Rating History</h2>
      <div className={styles.chartContainer}>
        <LineChart
          width={800}
          height={400}
          data={data}
          margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(dateStr) => format(parseISO(dateStr), 'MMM dd')}
            interval="preserveStartEnd"
            label={{ value: 'Date', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            domain={['dataMin - 100', 'dataMax + 100']}
            label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value) => [`Rating: ${value}`, '']}
            labelFormatter={(dateStr) => `Date: ${format(parseISO(dateStr), 'PPP')}`}
          />
          <Line type="monotoneX" dataKey="rating" stroke="#8884d8" />
          <Brush dataKey="date" height={30} stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
}

export default RatingsGraph;
