import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './loginsignup.module.css';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { FaFacebookF, FaGoogle, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LoginSignup = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [codeforcesId, setCodeforcesId] = useState('');
    const [error, setError] = useState('');
    const [alert, setAlert] = useState({ message: '', type: '', isVisible: false });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                const userData = {
                    id: data.user._id,
                    name: data.user.name,
                    email: data.user.email
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);
                navigate('/');
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('An error occurred during login', 'error');
        }
    };

    const showAlert = (message, type) => {
        setAlert({ message, type, isVisible: true });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const checkResponse = await axios.post('http://localhost:5000/api/auth/check-user', { email });
            if (checkResponse.data.message === 'Email is available') {
                navigate('/email-verification', { state: { name, email, password, codeforcesId } });
            } else {
                showAlert('Account with this Email Already Exists', 'error');
            }
        } catch (err) {
            if (err.response && err.response.status === 400) {
                showAlert(err.response.data.message, 'error');
            } else {
                showAlert('An error occurred during signup', 'error');
            }
        }
    };

    return (
        <motion.div 
            className={styles.body01}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <AlertPopup
                message={alert.message}
                type={alert.type}
                isVisible={alert.isVisible}
                onClose={() => setAlert({ ...alert, isVisible: false })}
            />
            
            <div className={styles['mobile-nav']}>
                <motion.button
                    className={!isActive ? styles.active : ''}
                    onClick={() => setIsActive(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Sign In
                </motion.button>
                <motion.button
                    className={isActive ? styles.active : ''}
                    onClick={() => setIsActive(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Sign Up
                </motion.button>
            </div>

            <motion.div 
                className={`${styles.container01} ${isActive ? styles.active : ''}`}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className={`${styles['form-container']} ${styles['sign-up']}`}>
                    <form onSubmit={handleSignup}>
                        <h1>Create Account</h1>
                        <div className={styles['social-icons']}>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaFacebookF /></motion.a>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaGoogle /></motion.a>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaGithub /></motion.a>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaLinkedinIn /></motion.a>
                        </div>
                        <span>or use your email for registration</span>
                        <motion.div className={styles.inputGroup}>
                            <input type="text" name="name" placeholder="Name" required onChange={(e) => setName(e.target.value)} />
                            <input type="email" name="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" name="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                            <input type="text" name="codeforcesId" placeholder="Codeforces ID" required onChange={(e) => setCodeforcesId(e.target.value)} />
                        </motion.div>
                        {error && <p className={styles.error}>{error}</p>}
                        <motion.button 
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign Up
                        </motion.button>
                    </form>
                </div>

                <div className={`${styles['form-container']} ${styles['sign-in']}`}>
                    <form onSubmit={handleLogin}>
                        <h1>Sign In</h1>
                        <div className={styles['social-icons']}>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaFacebookF /></motion.a>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaGoogle /></motion.a>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaGithub /></motion.a>
                            <motion.a whileHover={{ scale: 1.1 }} href="#"><FaLinkedinIn /></motion.a>
                        </div>
                        <span>or use your email password</span>
                        <motion.div className={styles.inputGroup}>
                            <input type="email" name="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" name="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                        </motion.div>
                        <Link to="/forgot-password" className={styles.forgotPassword}>Forgot your password?</Link>
                        <motion.button 
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign In
                        </motion.button>
                    </form>
                </div>

                <div className={styles['toggle-container']}>
                    <div className={styles.toggle}>
                        <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <motion.button 
                                className={styles.hidden}
                                onClick={() => setIsActive(false)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sign In
                            </motion.button>
                        </div>
                        <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <motion.button 
                                className={styles.hidden}
                                onClick={() => setIsActive(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Sign Up
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoginSignup;