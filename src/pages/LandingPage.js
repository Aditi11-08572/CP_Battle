import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCode, FaTrophy, FaUsers, FaChartLine, FaRocket, FaBrain } from 'react-icons/fa';
import { BiCode } from 'react-icons/bi';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const [isTyping, setIsTyping] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "Custom Contests",
      description: "Create private coding battles and compete with friends in real-time",
      icon: <FaCode />,
      color: "#00ff88"
    },
    {
      title: "Real-time Rankings",
      description: "Watch live as rankings update with every submission",
      icon: <FaChartLine />,
      color: "#00ffff"
    },
    {
      title: "Community Driven",
      description: "Connect with fellow programmers and grow together",
      icon: <FaUsers />,
      color: "#ff00ff"
    }
  ];

  const codeSnippet = `
class CodeCraft {
  constructor() {
    this.passion = "infinite";
    this.skills = ["algorithms", "data structures"];
    this.community = "growing";
  }

  async compete() {
    while(true) {
      await this.solve();
      this.learn();
      this.improve();
    }
  }
}

// Start your journey now!`;

  const [displayedCode, setDisplayedCode] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setDisplayedCode(codeSnippet.slice(0, index));
      index++;
      if (index > codeSnippet.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.landingContainer}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGrid} />
      
      <motion.div 
        className={styles.hero}
        style={{ opacity, y }}
      >
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div className={styles.glowingTitle}>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              Welcome to <span className={styles.gradientText}>CodeCraft</span>
            </motion.h1>
            
            <motion.div 
              className={styles.glowOrb}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Where Competitive Programming Meets Community
          </motion.p>

          <div className={styles.codeEditorWrapper}>
            <div className={styles.codeEditor}>
              <div className={styles.editorHeader}>
                <div className={styles.editorControls}>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                  <span className={styles.dot}></span>
                </div>
                <span className={styles.fileName}>codecraft.js</span>
              </div>
              <pre className={styles.code}>
                <code>{displayedCode}</code>
                {isTyping && <span className={styles.cursor}>|</span>}
              </pre>
            </div>
          </div>

          <motion.div 
            className={styles.ctaContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Link to="/login" className={styles.primaryBtn}>
              <span>Start Coding</span>
              <BiCode className={styles.btnIcon} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className={styles.featuresSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className={styles.sectionTitle}>
          <span className={styles.gradientText}>Features</span> that set us apart
        </h2>
        
        <div className={styles.features}>
          <AnimatePresence mode="wait">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                {...feature}
                isActive={index === activeFeature}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        className={styles.statsSection}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className={styles.statsContent}>
          <h2 className={styles.gradientText}>Our Impact</h2>
          <div className={styles.statsGrid}>
            <StatCard icon={<FaUsers />} number="10K+" label="Active Users" />
            <StatCard icon={<FaTrophy />} number="5K+" label="Contests Hosted" />
            <StatCard icon={<FaBrain />} number="1M+" label="Problems Solved" />
            <StatCard icon={<FaRocket />} number="100+" label="Countries Reached" />
          </div>
        </div>
      </motion.div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <h3 className={styles.gradientText}>CodeCraft</h3>
            <p>Empowering competitive programmers worldwide</p>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 CodeCraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, isActive }) => (
  <motion.div 
    className={`${styles.featureCard} ${isActive ? styles.activeFeature : ''}`}
    style={{ '--feature-color': color }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    <div className={styles.iconWrapper}>{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.div>
);

const StatCard = ({ icon, number, label }) => (
  <motion.div 
    className={styles.statCard}
    whileHover={{ scale: 1.1 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <div className={styles.statIcon}>{icon}</div>
    <h3>{number}</h3>
    <p>{label}</p>
  </motion.div>
);

export default LandingPage;