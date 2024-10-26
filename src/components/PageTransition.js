import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import styles from './PageTransition.module.css';

const PageTransition = (WrappedComponent) => {
  return function WithTransition(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isEntering, setIsEntering] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setIsEntering(true);
      }, 500); // Adjust this timing as needed

      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
      return <Spinner />;
    }

    return (
      <div className={`${styles.pageTransition} ${isEntering ? styles.enteringIn : ''}`}>
        <WrappedComponent {...props} />
      </div>
    );
  }
}

export default PageTransition;
