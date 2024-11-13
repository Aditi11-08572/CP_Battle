import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Competitive Programmer",
      image: "path/to/image1.jpg",
      text: "CP-Battle transformed my competitive programming journey. The custom contests feature is revolutionary!"
    },
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      image: "path/to/image2.jpg",
      text: "The real-time rankings and community features make practicing algorithms fun and engaging."
    },
    {
      name: "Mike Zhang",
      role: "CS Student",
      image: "path/to/image3.jpg",
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
        What Our <span className={styles.gradientText}>Users Say</span>
      </h2>
      
      <div className={styles.testimonialGrid}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={index} {...testimonial} index={index} />
        ))}
      </div>
    </motion.section>
  );
};

const TestimonialCard = ({ name, role, image, text, index }) => (
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
        <div className={styles.authorImage}>
          <img src={image} alt={name} />
        </div>
        <div className={styles.authorInfo}>
          <h4>{name}</h4>
          <span>{role}</span>
        </div>
      </div>
    </div>
    <div className={styles.testimonialGlow} />
  </motion.div>
);

export default TestimonialsSection; 