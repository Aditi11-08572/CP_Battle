import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './EmailVerification.module.css';
import { motion } from 'framer-motion';
import CustomAlert from '../components/CustomAlert';
import axios from 'axios';
import { debounce } from 'lodash';  // Make sure to install lodash if you haven't already

const EmailVerification = () => {
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [alert, setAlert] = useState({ message: '', type: '', isVisible: false });
    const navigate = useNavigate();
    const location = useLocation();
    const { name, email, password, codeforcesId } = location.state || {};
    const otpSentRef = useRef(false);
    const [isOtpSending, setIsOtpSending] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    const showAlert = (message, type) => {
        setAlert({ message, type, isVisible: true });
        setTimeout(() => setAlert({ ...alert, isVisible: false }), 3000);
    };

    const debouncedHandleSendOtp = useCallback(
        debounce(async () => {
            if (otpSentRef.current || isOtpSending) return;

            setIsOtpSending(true);
            try {
                const response = await fetch('https://cp-battle.onrender.com/api/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (response.ok) {
                    otpSentRef.current = true;
                    setIsOtpSent(true);
                    showAlert('OTP sent successfully!', 'success');
                } else {
                    showAlert(data.message || 'Failed to send OTP', 'error');
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
                showAlert('An error occurred. Please try again later.', 'error');
            } finally {
                setIsOtpSending(false);
            }
        }, 1000),  // 1 second debounce
        [email, isOtpSending]
    );

    useEffect(() => {
        if (!email) {
            navigate('/login');
        } else if (!otpSentRef.current) {
            debouncedHandleSendOtp();
        }
    }, [email, navigate, debouncedHandleSendOtp]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            console.log('Attempting to verify OTP for:', email, 'OTP:', otp);
            const response = await axios.post('https://cp-battle.onrender.com/api/auth/verify-otp', { email, otp });
            console.log('Verify OTP response:', response.data);
            if (response.data.message === 'OTP verified successfully') {
                showAlert('Email verified successfully!', 'success');
                handleCreateAccount();
            } else {
                showAlert('Invalid OTP', 'error');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error.response?.data || error.message);
            showAlert(error.response?.data?.message || 'An error occurred', 'error');
        }
    };

    const handleCreateAccount = async () => {
        try {
            console.log('Attempting to create account for:', email);
            const response = await axios.post('https://cp-battle.onrender.com/api/auth/signup', { name, email, password, codeforcesId });
            console.log('Signup response:', response.data);
            if (response.data.message === 'User registered successfully') {
                setSignupSuccess(true);
                showAlert('Account created successfully!', 'success');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                showAlert('Failed to create account', 'error');
            }
        } catch (error) {
            console.error('Error creating account:', error.response?.data || error.message);
            showAlert('An error occurred during signup', 'error');
        }
    };

    return (
        <div className={styles.emailVerificationContainer}>
            <CustomAlert
                message={alert.message}
                type={alert.type}
                isVisible={alert.isVisible}
                onClose={() => setAlert({ ...alert, isVisible: false })}
            />
            {signupSuccess ? (
                <motion.div 
                    className={styles.successAnimation}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100"
                        height="100"
                        viewBox="0 0 24 24"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <motion.path
                            fill="none"
                            stroke="#4CAF50"
                            strokeWidth="2"
                            d="M3 12l6 6L21 6"
                        />
                    </motion.svg>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                    >
                        Signup Successful!
                    </motion.p>
                </motion.div>
            ) : (
                <motion.div 
                    className={styles.emailVerificationCard}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2>Verify Your Email</h2>
                    {isOtpSent ? (
                        <>
                            <p>We've sent an OTP to {email}. Please enter it below to verify your email.</p>
                            <form onSubmit={handleVerifyOtp}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        required
                                    />
                                </div>
                                <motion.button 
                                    type="submit" 
                                    className={styles.submitBtn}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Verify OTP
                                </motion.button>
                            </form>
                            <button onClick={debouncedHandleSendOtp} className={styles.resendBtn}>Resend OTP</button>
                        </>
                    ) : (
                        <p>Sending OTP to {email}...</p>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default EmailVerification;
