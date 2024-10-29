import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAlert from '../components/CustomAlert';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1);
    const [showTick, setShowTick] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '', isVisible: false });
    const navigate = useNavigate();

    const showAlert = (message, type) => {
        setAlert({ message, type, isVisible: true });
        setTimeout(() => setAlert({ ...alert, isVisible: false }), 3000);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://codecraft-contest1.onrender.com/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (response.ok) {
                showAlert(data.message, 'success');
                setStep(2);
            } else {
                showAlert(data.message || 'An error occurred', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again later.', 'error');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://codecraft-contest1.onrender.com/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();
            if (response.ok) {
                showAlert(data.message, 'success');
                setStep(3);
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            showAlert('An error occurred', 'error');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://codecraft-contest1.onrender.com/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });

            const data = await response.json();
            if (response.ok) {
                showAlert('Password reset successfully!', 'success');
                setShowTick(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            showAlert('An error occurred', 'error');
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { 
            opacity: 1, 
            x: 0, 
            transition: { 
                type: "spring",
                stiffness: 300,
                damping: 20
            } 
        },
        exit: { 
            opacity: 0, 
            x: 50, 
            transition: { duration: 0.2 } 
        }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.05, 
            boxShadow: "0px 5px 10px rgba(0,0,0,0.2)",
            transition: { type: "spring", stiffness: 400, damping: 10 }
        },
        tap: { scale: 0.95 }
    };

    const ProgressStep = ({ number, isActive, isCompleted }) => (
        <motion.div 
            className={`${styles.progressStep} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30, delay: number * 0.1 }}
        >
            {isCompleted ? '✓' : number}
        </motion.div>
    );

    useEffect(() => {
        const createBubble = () => {
            const bubble = document.createElement('div');
            bubble.classList.add(styles.floatingBubble);
            
            const size = Math.random() * 60 + 10;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = `${Math.random() * 100}%`;
            
            document.querySelector(`.${styles.forgotPasswordContainer}`).appendChild(bubble);
            
            setTimeout(() => {
                bubble.remove();
            }, 4000);
        };

        const bubbleInterval = setInterval(createBubble, 300);

        return () => clearInterval(bubbleInterval);
    }, []);

    const tickVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { 
            scale: 1, 
            opacity: 1, 
            transition: { 
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.6 
            } 
        }
    };

    return (
        <div className={styles.forgotPasswordContainer}>
            <CustomAlert
                message={alert.message}
                type={alert.type}
                isVisible={alert.isVisible}
                onClose={() => setAlert({ ...alert, isVisible: false })}
            />
            <motion.div 
                className={styles.forgotPasswordCard}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {!showTick ? (
                    <>
                        <motion.h2
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Password Recovery
                        </motion.h2>
                        <div className={styles.progressContainer}>
                            <ProgressStep number={1} isActive={step >= 1} isCompleted={step > 1} />
                            <ProgressStep number={2} isActive={step >= 2} isCompleted={step > 2} />
                            <ProgressStep number={3} isActive={step >= 3} isCompleted={step > 3} />
                            <div className={styles.progressLine}></div>
                            <motion.div 
                                className={styles.progressLineActive}
                                initial={{ width: 0 }}
                                animate={{ width: `${((step - 1) / 2) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={styles.formContainer}
                            >
                                {step === 1 && (
                                    <form onSubmit={handleSendOtp}>
                                        <div className={styles.inputGroup}>
                                            <motion.input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                required
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                        </div>
                                        <motion.button 
                                            type="submit" 
                                            className={styles.submitBtn}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            Send OTP
                                        </motion.button>
                                    </form>
                                )}
                                {step === 2 && (
                                    <form onSubmit={handleVerifyOtp}>
                                        <div className={styles.inputGroup}>
                                            <motion.input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter OTP"
                                                required
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                        </div>
                                        <motion.button 
                                            type="submit" 
                                            className={styles.submitBtn}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            Verify OTP
                                        </motion.button>
                                    </form>
                                )}
                                {step === 3 && (
                                    <form onSubmit={handleResetPassword}>
                                        <div className={styles.inputGroup}>
                                            <motion.input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Enter new password"
                                                required
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            />
                                        </div>
                                        <motion.button 
                                            type="submit" 
                                            className={styles.submitBtn}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                        >
                                            Reset Password
                                        </motion.button>
                                    </form>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </>
                ) : (
                    <motion.div
                        className={styles.tickContainer}
                        variants={tickVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <svg className={styles.tickSvg} viewBox="0 0 52 52">
                            <circle className={styles.tickCircle} cx="26" cy="26" r="25" fill="none"/>
                            <path className={styles.tickPath} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                        </svg>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
