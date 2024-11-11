import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <h3 className={styles.gradientText}>CodeCraft</h3>
            <p>Empowering competitive programmers worldwide</p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <h4>Platform</h4>
              <Link to="/features">Features</Link>
              <Link to="/contests">Contests</Link>
              <Link to="/leaderboard">Leaderboard</Link>
            </div>
            
            <div className={styles.linkColumn}>
              <h4>Community</h4>
              <Link to="/blog">Blog</Link>
              <Link to="/forums">Forums</Link>
              <Link to="/discord">Discord</Link>
            </div>
            
            <div className={styles.linkColumn}>
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>© 2024 CodeCraft. All rights reserved.</p>
          <div className={styles.footerSocial}>
            <a href="#" aria-label="GitHub"><FaGithub /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className={styles.footerGlow} />
    </footer>
  );
};

export default Footer; 