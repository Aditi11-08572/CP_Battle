import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CustomAlert.module.css';

const CustomAlert = ({ message, type, isVisible, onClose }) => {
  const alertVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const iconVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { delay: 0.2, type: "spring", stiffness: 500, damping: 15 } }
  };

  const getIcon = () => {
    switch(type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'info': return 'ℹ';
      default: return '!';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`${styles.alertContainer} ${styles[type]}`}
          variants={alertVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.span 
            className={styles.icon}
            variants={iconVariants}
          >
            {getIcon()}
          </motion.span>
          <p>{message}</p>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomAlert;
