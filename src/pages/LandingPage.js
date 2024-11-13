import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCode, FaTrophy, FaUsers, FaChartLine, FaRocket, FaBrain, FaLightbulb, FaCrown } from 'react-icons/fa';
import { BiCode } from 'react-icons/bi';
import { RiAwardLine, RiTeamLine, RiRocketLine } from 'react-icons/ri';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  const [isTyping, setIsTyping] = useState(true);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]));
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.5], [1, 0]));

  const features = [
    {
      title: "Custom Contests",
      description: "Create private coding battles tailored to your group's skill level",
      icon: <FaCrown />,
      color: "#00fff2"
    },
    {
      title: "Real-time Rankings",
      description: "Experience the thrill of live competition with instant updates",
      icon: <RiAwardLine />,
      color: "#ff00d4"
    },
    {
      title: "Community Driven",
      description: "Join a thriving ecosystem of passionate programmers",
      icon: <RiTeamLine />,
      color: "#00ff88"
    },
    {
      title: "Advanced Analytics",
      description: "Track your progress with detailed performance insights",
      icon: <RiRocketLine />,
      color: "#ff8800"
    }
  ];

  const codeSnippet = `
class CP-Battle {
  constructor() {
    this.passion = "∞";
    this.skills = ["DSA", "CP", "Problem Solving"];
    this.mode = "competitive";
  }

  async compete() {
    while(this.passion) {
      await this.solve();
      this.learn();
      this.grow();
      // Repeat infinitely
    }
  }
}

// Your coding journey begins here
const yourJourney = new CP-Battle();
yourJourney.compete();`;

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
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      setMousePosition({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    }
  };

  return (
    <div className={styles.landingContainer}>
      <div className={styles.particlesContainer}>
        {[...Array(50)].map((_, i) => (
          <div key={i} className={styles.particle} />
        ))}
      </div>
      
      <motion.div 
        ref={heroRef}
        className={styles.hero}
        onMouseMove={handleMouseMove}
        style={{ opacity }}
      >
        <div className={styles.glowingOrbs}>
          <motion.div 
            className={styles.orb}
            animate={{
              x: mousePosition.x * 30,
              y: mousePosition.y * 30,
            }}
          />
          <motion.div 
            className={styles.orb}
            animate={{
              x: mousePosition.x * -30,
              y: mousePosition.y * -30,
            }}
          />
        </div>

        <motion.div className={styles.heroContent}>
          <motion.div 
            className={styles.titleContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className={styles.gradientText}>
              Welcome to <span className={styles.gradientText}>CP-Battle</span>
            </h1>
            <div className={styles.titleDecoration} />
          </motion.div>

          <motion.p 
            className={styles.subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Where Competitive Programming Meets Innovation
          </motion.p>

          <div className={styles.codeEditorContainer}>
            <motion.div 
              className={styles.codeEditor}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.editorHeader}>
                <div className={styles.editorControls}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
                <span className={styles.fileName}>journey.js</span>
                <div className={styles.editorActions}>
                  <span className={styles.action}>JavaScript</span>
                  <span className={styles.action}>UTF-8</span>
                </div>
              </div>
              <div className={styles.editorContent}>
                {/* <div className={styles.lineNumbers}>
                  {displayedCode.split('\n').map((_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div> */}
                <pre className={styles.code}>
                  <code>{displayedCode}</code>
                  {isTyping && <span className={styles.cursor}>|</span>}
                </pre>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className={styles.ctaContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Link to="/login" className={styles.primaryBtn}>
              <span>Begin Your Journey</span>
              <BiCode className={styles.btnIcon} />
              <div className={styles.btnGlow} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.section className={styles.featuresSection}>
        <motion.h2 
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className={styles.gradientText}>Revolutionary Features</span> 
        </motion.h2>
        
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title}
              {...feature}
              index={index}
              isActive={index === activeFeature}
            />
          ))}
        </div>
      </motion.section>

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

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

const StatsSection = () => {
  const stats = [
    { icon: <FaUsers />, number: "20+", label: "Active Users" },
    { icon: <FaTrophy />, number: "100+", label: "Contests Hosted" },
    { icon: <FaBrain />, number: "350+", label: "Problems Solved" },
    { icon: <FaRocket />, number: "5+", label: "Countries Reached" }
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
         <span className={styles.gradientText}> Our Global Impact</span>
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

  return (
    <motion.div 
      className={styles.statCard}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      onViewportEnter={() => setIsInView(true)}
    >
      <div className={styles.statIcon}>{icon}</div>
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

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Rohit Wadne",
      role: "Competitive Programmer",
      text: "CP-Battle transformed my competitive programming journey. The custom contests feature is revolutionary!"
    },
    {
      name: "Kishor Pandhare",
      role: "Software Engineer",
      text: "The real-time rankings and community features make practicing algorithms fun and engaging."
    },
    {
      name: "Mike Zhang",
      role: "CS Student",
      text: "Best platform for improving problem-solving skills with friends. Highly recommended!"
    }
  ];

  return (
    <motion.section 
      className={styles.testimonialsSection}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <h2 className={styles.sectionTitle}>
         <span className={styles.gradientText}>What Our Users Say</span>
      </h2>
      
      <div className={styles.testimonialGrid}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} index={index} />
        ))}
      </div>
    </motion.section>
  );
};

const TestimonialCard = ({ name, role, text, index }) => (
  <motion.div 
    className={styles.testimonialCard}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -10 }}
  >
    <div className={styles.testimonialContent}>
      <div className={styles.quoteIcon}>"</div>
      <p>{text}</p>
      <div className={styles.testimonialAuthor}>
        <div className={styles.authorInfo}>
          <h4>{name}</h4>
          <span>{role}</span>
        </div>
      </div>
    </div>
    <div className={styles.testimonialGlow} />
  </motion.div>
);

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <h3 className={styles.gradientText}>CP-Battle</h3>
            <p>Empowering competitive programmers worldwide</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2024 CP-Battle. All rights reserved.</p>
        </div>
      </div>
      <div className={styles.footerGlow} />
    </footer>
  );
};

export default LandingPage;