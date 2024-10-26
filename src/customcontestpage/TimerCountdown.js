import React, { useState, useEffect } from "react";
import styles from './TimerCountdown.module.css'; // Import the CSS module for styling

const TimerCountdown = ({ startTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(startTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const addLeadingZero = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  const formatTimeLeft = () => {
    if (Object.keys(timeLeft).length === 0) {
      return "Contest has started!";
    }

    const parts = [];
    if (timeLeft.days > 0) {
      parts.push(`${timeLeft.days}d`);
    }
    if (timeLeft.hours > 0 || parts.length > 0) {
      parts.push(`${addLeadingZero(timeLeft.hours)}h`);
    }
    if (timeLeft.minutes > 0 || parts.length > 0) {
      parts.push(`${addLeadingZero(timeLeft.minutes)}m`);
    }
    parts.push(`${addLeadingZero(timeLeft.seconds)}s`);

    return `Contest starts in: ${parts.join(' ')}`;
  };

  return (
    <div className={styles.countdown}>
      {formatTimeLeft()}
    </div>
  );
};

export default TimerCountdown;
