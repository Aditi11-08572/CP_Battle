import React, { useState, useEffect } from 'react';
import { format, startOfYear, eachDayOfInterval } from 'date-fns';
import styles from './SubmissionHeatMap.module.css'; // Import the CSS Module

function SubmissionHeatMap() {
  const [submissionData, setSubmissionData] = useState(() => {
    const savedData = localStorage.getItem('submissionData');
    return savedData ? JSON.parse(savedData) : {};
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [inputDate, setInputDate] = useState('');
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('submissionData', JSON.stringify(submissionData));
  }, [submissionData]);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleSubmission = (e) => {
    e.preventDefault();
    const dateKey = format(new Date(inputDate), 'yyyy-MM-dd');
    setSubmissionData((prevData) => ({
      ...prevData,
      [dateKey]: submissionCount,
    }));
  };

  const getDaysOfYear = (year) => {
    const start = startOfYear(new Date(year, 0, 1));
    return eachDayOfInterval({
      start,
      end: new Date(year, 11, 31),
    }).map((day) => ({
      date: day,
      formattedDate: format(day, 'yyyy-MM-dd'),
      submissions: submissionData[format(day, 'yyyy-MM-dd')] || 0,
    }));
  };

  const daysOfYear = getDaysOfYear(selectedYear);

  const getColor = (submissions) => {
    if (submissions >= 3) return '#006633';  // Dark green for 3 or more submissions
    if (submissions === 2) return '#27D43E';  // Green for 2 submissions
    if (submissions === 1) return '#66FF66';  // Light green for 1 submission
    return '#ebedf0';  // Default gray for 0 submissions
  };

  return (
    <div className={styles.container02}>
      <label>
        Select Year:
        <input type="number" value={selectedYear} onChange={handleYearChange} />
      </label>

      <form onSubmit={handleSubmission}>
        <label>
          Enter Date (YYYY-MM-DD):
          <input
            type="date"
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
          />
        </label>

        <label>
          Enter Number of Submissions (1, 2, 3+):
          <input
            type="number"
            min="1"
            value={submissionCount}
            onChange={(e) => setSubmissionCount(parseInt(e.target.value, 10))}
          />
        </label>

        <button type="submit">Submit</button>
      </form>

      <div className={styles.calendarHeatmap}>
        {daysOfYear.map((day) => (
          <div
            key={day.formattedDate}
            className={styles.dayCell}
            style={{ backgroundColor: getColor(day.submissions) }}
            title={`${day.formattedDate} - ${day.submissions} submissions`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default SubmissionHeatMap;
