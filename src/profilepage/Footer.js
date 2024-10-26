import React from 'react';
import styles from './Footer.module.css'; // Import the CSS Module
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'; // Importing icons

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerLinks}>
          <div className={styles.footerSection}>
            <h2 className={styles.h22}>About Us</h2>
            <p className={styles.p1}>Your Company is a platform for competitive programming and coding contests.</p>
          </div>
          <div className={styles.footerSection}>
            <h2 className={styles.h22}>Quick Links</h2>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#profile">Profile</a></li>
              <li><a href="#statistics">Statistics</a></li>
              <li><a href="#submissions">Submissions</a></li>
              <li><a href="#discussions">Discussions</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h2 className={styles.h22}>Contact Us</h2>
            <p className={styles.p1}>Email: support@yourcompany.com</p>
            <p className={styles.p1}>Phone: (123) 456-7890</p>
          </div>
          <div className={`${styles.footerSection} ${styles.socialMedia}`}>
            <h2 className={styles.h22}>Follow Us</h2>
            <ul className={styles.socialLinks}>
              <li><a href="#facebook"><FaFacebookF /></a></li>
              <li><a href="#twitter"><FaTwitter /></a></li>
              <li><a href="#instagram"><FaInstagram /></a></li>
              <li><a href="#linkedin"><FaLinkedin /></a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.p1}>&copy; 2024 Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
