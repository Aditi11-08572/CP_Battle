import React, { useEffect } from 'react';
import styles from './AlertPopup.module.css';

const AlertPopup = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.alertOverlay}>
      <div className={`${styles.alert} ${styles[type]}`} style={{ color: '#000000 !important' }}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default AlertPopup;
