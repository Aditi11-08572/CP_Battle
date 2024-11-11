// About.js
import React, { useEffect, useState } from 'react';
import Navbar from '../profilepage/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faYoutube, faLinkedinIn, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import styles from './About.module.css';

const About = () => {
  const [headingText, setHeadingText] = useState('');
  const fullHeading = 'MEEET OUR TEAM';
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullHeading.length) {
        setHeadingText((prev) => prev + fullHeading.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsLoaded(true);
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  const teamMembers = [
    {
      name: "Laxmikant Mahindrakar",
      job: "Software Developer",
      about: "Coder at Leetcode.\nMERN Stack && Android Dev.\nLogic Creates Magic!!!",
      image: "Laxmikant.jpg",
      topImage: "https://i.imgur.com/vG9oi4t.jpg",
      whatsapp: "918767369115",
      social: [
        { icon: faFacebookF, link: "https://www.facebook.com/laxmikant.mahindrakar.98" },
        { icon: faYoutube, link: "https://www.youtube.com/@MahindraTechCoaching" },
        { icon: faLinkedinIn, link: "https://www.linkedin.com/in/laxmikant-mahindrakar-581277251/" }
      ]
    },
    {
      name: "Shreyash Deotale",
      job: "Software Developer",
      about: "Coder at Codeforces.\nMERN Stack Dev.\nCoding is Fun!!!",
      image: "Shreyash.png",
      topImage: "https://i.imgur.com/imYngbb.jpg",
      whatsapp: "917397971052",
      social: [
        { icon: faLinkedinIn, link: "https://www.linkedin.com/in/ironman-marvel-28355925b/" }
      ]
    },
    {
      name: "Rohit Shinde",
      job: "Software Tester",
      about: "Excited to Explore new things",
      image: "Bacchi.jpg",
      topImage: "background_bacchi.jpg",
      whatsapp: "918591711567",
      social: [] // Add an empty array if there are no social links
    }
  ];

  return (
    <>
      <Navbar />
      <div className={styles.container01}>
        <div className={styles.backgroundAnimation}></div>
        <motion.div
          className={styles.heading}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {headingText}
        </motion.div>

        <AnimatePresence>
          {isLoaded && (
            <motion.div
              className={styles.cardsWrapper}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  className={styles.card}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 1 }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                >
                  <div className={styles.cardContent}>
                    <div className={styles.imageContainer}>
                      <img src={member.topImage} alt="top" className={styles.imageTop} />
                      <div className={styles.overlay}></div>
                    </div>
                    <img src={member.image} alt={member.name} className={styles.profileImage} />
                    <h1 className={styles.fullname}>{member.name}</h1>
                    <h3 className={styles.job}>{member.job}</h3>
                    <p className={styles.aboutMe}>{member.about}</p>
                    <motion.button
                      className={styles.contactButton}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(`https://wa.me/${member.whatsapp}`, '_blank')}
                    >
                      <FontAwesomeIcon icon={faWhatsapp} /> Contact me
                    </motion.button>
                    {member.social && member.social.length > 0 && (
                      <ul className={styles.socialIcons}>
                        {member.social.map((social, socialIndex) => (
                          <motion.li key={socialIndex} whileHover={{ y: -5, scale: 1.2 }}>
                            <a href={social.link} target="_blank" rel="noopener noreferrer">
                              <FontAwesomeIcon icon={social.icon} />
                            </a>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default About;
