import { useState, useEffect } from 'react';

export const useSubmittedContests = () => {
  const [submittedContests, setSubmittedContests] = useState([]);

  useEffect(() => {
    const storedContests = JSON.parse(localStorage.getItem('submittedContests') || '[]');
    setSubmittedContests(storedContests);
  }, []);

  const addSubmittedContest = (contestId) => {
    setSubmittedContests(prev => {
      const updatedContests = [...prev, contestId];
      localStorage.setItem('submittedContests', JSON.stringify(updatedContests));
      return updatedContests;
    });
  };

  return { submittedContests, addSubmittedContest };
};
