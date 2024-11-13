import React, { useContext, useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';
import { UserContext } from './UserContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faTrophy, faInfoCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const CustomNavbar = () => {
  const { userData, setUserData } = useContext(UserContext);
  const [hoveredLink, setHoveredLink] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const linkVariants = {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    hover: {
      scale: 1.1,
      textShadow: "0px 0px 8px rgb(255,255,255)",
      transition: {
        duration: 0.2,
        yoyo: Infinity
      }
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: faHome },
    { name: 'Friends', path: '/my-friends', icon: faUsers },
    { name: 'Contests', path: '/contests', icon: faTrophy },
    { name: 'About', path: '/about', icon: faInfoCircle }
  ];

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('token');
    navigate('/landing');
  };

  return (
    <Navbar expand="lg" className={styles.customNavbar}>
      <Container className={styles.container}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar.Brand as={Link} to="/" className={styles.brand}>
            <motion.span
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              CP-Battle
            </motion.span>
          </Navbar.Brand>
        </motion.div>
        {/* <Navbar.Toggle aria-controls="basic-navbar-nav" /> */}
        <Navbar.Collapse id="basic-navbar-nav" className={styles.navbarCollapse}>
          <Nav className={styles.navLinks}>
            <AnimatePresence>
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={linkVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Nav.Link
                    as={Link}
                    to={item.path}
                    className={`${styles.link} ${location.pathname === item.path ? styles.activeLink : ''}`}
                    onMouseEnter={() => setHoveredLink(item.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.span variants={linkVariants} whileHover="hover">
                      <FontAwesomeIcon icon={item.icon} className={styles.icon} /> {item.name}
                    </motion.span>
                    {(hoveredLink === item.name || location.pathname === item.path) && (
                      <motion.div
                        className={styles.linkUnderline}
                        layoutId="underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </Nav.Link>
                </motion.div>
              ))}
              {userData && (
                <motion.div
                  variants={linkVariants}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: navItems.length * 0.1 }}
                >
                  <Nav.Link
                    className={`${styles.link} ${styles.logoutLink}`}
                    onClick={handleLogout}
                    onMouseEnter={() => setHoveredLink('Logout')}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <motion.span variants={linkVariants} whileHover="hover">
                      <FontAwesomeIcon icon={faSignOutAlt} className={styles.icon} /> Logout
                    </motion.span>
                    {hoveredLink === 'Logout' && (
                      <motion.div
                        className={styles.linkUnderline}
                        layoutId="underline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </Nav.Link>
                </motion.div>
              )}
            </AnimatePresence>
          </Nav>
          {userData && userData.profileImage && (
            <motion.div
              className={styles.profileSection}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <Link to="/profile" className={styles.profileLink}>
                  <img
                    src={userData.profileImage}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;




/*
<a href="#profile-icon">
<img
  src="/tourist-1.jpg" // Replace with actual image URL
  alt="Profile"
  className={styles.profileImage}
/>
</a>
*/
