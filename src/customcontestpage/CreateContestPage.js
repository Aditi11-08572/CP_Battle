import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// ... other imports ...

const CreateContestPage = () => {
  const [contestName, setContestName] = useState('');
  const [participants, setParticipants] = useState(1);
  const [duration, setDuration] = useState(60); // in minutes
  const [minRating, setMinRating] = useState(800);
  const [maxRating, setMaxRating] = useState(3500);
  const [selectedTags, setSelectedTags] = useState([]);
  const [numQuestions, setNumQuestions] = useState(5);
  const navigate = useNavigate();

  const handleCreateContest = async (e) => {
    e.preventDefault();
    try {
      // Fetch new questions based on the contest parameters
      const response = await axios.get('https://codeforces.com/api/problemset.problems');
      let allProblems = response.data.result.problems;

      // Filter problems based on rating and tags
      let filteredProblems = allProblems.filter(problem => 
        problem.rating >= minRating && 
        problem.rating <= maxRating &&
        (selectedTags.length === 0 || selectedTags.some(tag => problem.tags.includes(tag)))
      );

      // Randomly select the specified number of questions
      let selectedQuestions = [];
      for (let i = 0; i < numQuestions && filteredProblems.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        selectedQuestions.push(filteredProblems[randomIndex]);
        filteredProblems.splice(randomIndex, 1);
      }

      // Navigate to the contest page with the new questions
      navigate('/contest', {
        state: {
          contestName,
          participants,
          duration,
          minRating,
          maxRating,
          selectedTags,
          questions: selectedQuestions,
          startTime: new Date().getTime()
        }
      });
    } catch (error) {
      console.error('Error creating contest:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleCreateContest}>
      {/* Form inputs for contest parameters */}
      <input
        type="text"
        value={contestName}
        onChange={(e) => setContestName(e.target.value)}
        placeholder="Contest Name"
        required
      />
      {/* Add other inputs for participants, duration, ratings, tags, etc. */}
      <button type="submit">Create Contest</button>
    </form>
  );
};

export default CreateContestPage;
