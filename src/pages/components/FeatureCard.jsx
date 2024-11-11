import React from 'react';
import { motion } from 'framer-motion';
import styles from './FeatureCard.module.css';

const FeatureCard = ({ icon, title, description, color, index, isActive }) => {
  return (
    <motion.div 
      className={`${styles.featureCard} ${isActive ? styles.activeFeature : ''}`}
      style={{ '--feature-color': color }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <div className={styles.featureIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className={styles.featureGlow} />
    </motion.div>
  );
};

export default FeatureCard; 