import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCode, FaTrophy, FaUsers, FaChartLine, FaGithub, FaGoogle } from 'react-icons/fa';
import { BiCode } from 'react-icons/bi';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const [isTyping, setIsTyping] = useState(true);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const codeSnippet = `
function CodeCraft() {
  const passion = "coding";
  const community = "growing";
  const future = "bright";
  
  return success;
}`;

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

  return (
    <div className={styles.landingContainer}>
      <div className={styles.backgroundAnimation} />
      
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
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            Welcome to <span className={styles.gradient}>CodeCraft</span>
          </motion.h1>
          
          <motion.p className={styles.subtitle}>
            Where Competitive Programming Meets Community
          </motion.p>

          <div className={styles.codeEditor}>
            <div className={styles.editorHeader}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
            <pre className={styles.code}>
              <code>{displayedCode}</code>
              {isTyping && <span className={styles.cursor}>|</span>}
            </pre>
          </div>

          <motion.div className={styles.ctaContainer}>
            <Link to="/login" className={styles.primaryBtn}>
              <span>Get Started</span>
              <BiCode className={styles.btnIcon} />
            </Link>
            <div className={styles.authButtons}>
              <button className={styles.githubBtn}>
                <FaGithub /> Continue with GitHub
              </button>
              <button className={styles.googleBtn}>
                <FaGoogle /> Continue with Google
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className={styles.featuresSection}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className={styles.sectionTitle}>Why Choose CodeCraft?</h2>
        
        <div className={styles.features}>
          <FeatureCard 
            icon={<FaUsers />}
            title="Community-Driven"
            description="Connect with fellow programmers, send friend requests, and get personalized suggestions."
          />
          <FeatureCard 
            icon={<FaTrophy />}
            title="Custom Contests"
            description="Create private contests for your group and compete in real-time with friends."
          />
          <FeatureCard 
            icon={<FaChartLine />}
            title="Real-time Rankings"
            description="Track your progress and see how you stack up against others instantly."
          />
        </div>
      </motion.div>

      <motion.div 
        className={styles.communitySection}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className={styles.communityContent}>
          <h2>Join Our Growing Community</h2>
          <div className={styles.stats}>
            <StatCard number="10K+" label="Active Users" />
            <StatCard number="5K+" label="Daily Contests" />
            <StatCard number="1M+" label="Problems Solved" />
          </div>
        </div>
      </motion.div>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>CodeCraft</h3>
            <p>Empowering competitive programmers worldwide</p>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 CodeCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    className={styles.featureCard}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className={styles.iconWrapper}>{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </motion.div>
);

const StatCard = ({ number, label }) => (
  <motion.div 
    className={styles.statCard}
    whileHover={{ scale: 1.1 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <h3>{number}</h3>
    <p>{label}</p>
  </motion.div>
);

export default LandingPage; 