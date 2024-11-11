import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { FaUsers, FaTrophy, FaBrain, FaRocket } from 'react-icons/fa';
import styles from './StatsSection.module.css';

const StatsSection = () => {
  const stats = [
    { icon: <FaUsers />, number: "10K+", label: "Active Users" },
    { icon: <FaTrophy />, number: "5K+", label: "Contests Hosted" },
    { icon: <FaBrain />, number: "1M+", label: "Problems Solved" },
    { icon: <FaRocket />, number: "100+", label: "Countries Reached" }
  ];

  return (
    <motion.section 
      className={styles.statsSection}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className={styles.statsContent}>
        <motion.h2 
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Global <span className={styles.gradientText}>Impact</span>
        </motion.h2>
        
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} index={index} />
          ))}
        </div>
      </div>
      <div className={styles.statsBackground} />
    </motion.section>
  );
};

const StatCard = ({ icon, number, label, index }) => {
  const [isInView, setIsInView] = useState(false);
  const controls = useAnimation();

  return (
    <motion.div 
      className={styles.statCard}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      onViewportEnter={() => setIsInView(true)}
    >
      <motion.div 
        className={styles.statIcon}
        animate={controls}
      >
        {icon}
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      >
        {number}
      </motion.h3>
      <p>{label}</p>
    </motion.div>
  );
};

export default StatsSection; 