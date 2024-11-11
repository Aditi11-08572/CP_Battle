import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { FaCode, FaTrophy, FaUsers, FaChartLine } from 'react-icons/fa';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={styles.landingContainer}>
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          Welcome to CP Battle
        </motion.h1>
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Compete, Learn, and Master Competitive Programming
        </motion.p>
        <motion.div 
          className={styles.ctaButtons}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <Link to="/login" className={styles.primaryBtn}>
            Get Started
          </Link>
          <Link to="/about" className={styles.secondaryBtn}>
            Learn More
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className={styles.features}
      >
        <motion.div variants={itemVariants} className={styles.featureCard}>
          <FaCode className={styles.icon} />
          <h3>Custom Contests</h3>
          <p>Create and participate in personalized coding competitions</p>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.featureCard}>
          <FaTrophy className={styles.icon} />
          <h3>Real-time Rankings</h3>
          <p>Track your progress and compete with others globally</p>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.featureCard}>
          <FaUsers className={styles.icon} />
          <h3>Community</h3>
          <p>Join a growing community of competitive programmers</p>
        </motion.div>

        <motion.div variants={itemVariants} className={styles.featureCard}>
          <FaChartLine className={styles.icon} />
          <h3>Performance Analytics</h3>
          <p>Detailed insights into your coding performance</p>
        </motion.div>
      </motion.div>

      <motion.div 
        className={styles.statsSection}
        initial={{ opacity: 0, y: 50 }}
        animate={controls}
        variants={{
          visible: { opacity: 1, y: 0 }
        }}
      >
        <div className={styles.statCard}>
          <h4>1000+</h4>
          <p>Active Users</p>
        </div>
        <div className={styles.statCard}>
          <h4>500+</h4>
          <p>Contests Hosted</p>
        </div>
        <div className={styles.statCard}>
          <h4>5000+</h4>
          <p>Problems Solved</p>
        </div>
      </motion.div>

      <footer className={styles.footer}>
        <p>© 2024 CP Battle. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage; 