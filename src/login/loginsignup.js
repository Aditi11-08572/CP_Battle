import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './loginsignup.module.css';
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { FiMail, FiLock, FiUser, FiCode } from 'react-icons/fi';

const LoginSignup = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
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

        const container = document.getElementById('container');
        const registerBtn = document.getElementById('register');
        const loginBtn = document.getElementById('login');

        const addActive = () => setIsActive(true);
        const removeActive = () => setIsActive(false);

        registerBtn.addEventListener('click', addActive);
        loginBtn.addEventListener('click', removeActive);

        return () => {
            registerBtn.removeEventListener('click', addActive);
            loginBtn.removeEventListener('click', removeActive);
        };
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        const password = e.target.elements.password.value;

        try {
            const response = await fetch('https://cp-battle.onrender.com/api/auth/signin', {
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
                console.log('User data to be stored:', userData);
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
            const checkResponse = await axios.post('https://cp-battle.onrender.com/api/auth/check-user', { email });
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

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className={styles.body01}>
            <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={styles.particle} />
                ))}
            </div>
            
            <motion.div 
                className={`${styles.container01} ${isActive ? styles.active : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.formWrapper}>
                    <motion.div 
                        className={`${styles['form-container']} ${styles['sign-up']}`}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: isActive ? 0 : 300, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <form onSubmit={handleSignup}>
                            <motion.h1 
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                Create Account
                            </motion.h1>
                            
                            <div className={styles.inputGroup}>
                                <FiUser className={styles.inputIcon} />
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Name" 
                                    required 
                                    onChange={(e) => setName(e.target.value)} 
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <FiMail className={styles.inputIcon} />
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    required 
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <FiLock className={styles.inputIcon} />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Password" 
                                    required 
                                    onChange={(e) => setPassword(e.target.value)} 
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <FiCode className={styles.inputIcon} />
                                <input 
                                    type="text" 
                                    name="codeforcesId" 
                                    placeholder="Codeforces ID" 
                                    required 
                                    onChange={(e) => setCodeforcesId(e.target.value)} 
                                />
                            </div>

                            {error && <p className={styles.error}>{error}</p>}
                            
                            <motion.button 
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Sign Up
                            </motion.button>
                        </form>
                    </motion.div>

                    <motion.div 
                        className={`${styles['form-container']} ${styles['sign-in']}`}
                        initial={{ x: 0, opacity: 1 }}
                        animate={{ x: isActive ? -300 : 0, opacity: isActive ? 0 : 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <form onSubmit={handleLogin}>
                            <motion.h1
                                initial={{ y: -20 }}
                                animate={{ y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                Welcome Back
                            </motion.h1>

                            <div className={styles.inputGroup}>
                                <FiMail className={styles.inputIcon} />
                                <input type="email" name="email" placeholder="Email" required />
                            </div>

                            <div className={styles.inputGroup}>
                                <FiLock className={styles.inputIcon} />
                                <input type="password" name="password" placeholder="Password" required />
                            </div>

                            <Link to="/forgot-password" className={styles.forgotPassword}>
                                Forgot your password?
                            </Link>

                            <motion.button 
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Sign In
                            </motion.button>
                        </form>
                    </motion.div>

                    <div className={styles.overlayContainer}>
                        <motion.div 
                            className={styles.overlay}
                            animate={{ x: isActive ? '100%' : '0%' }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={styles.overlayPanel}>
                                <h2>{isActive ? 'Already have an account?' : 'New here?'}</h2>
                                <p>
                                    {isActive 
                                        ? 'Sign in to continue your journey with us'
                                        : 'Join us and start your competitive programming journey'
                                    }
                                </p>
                                <motion.button 
                                    className={styles.ghostButton}
                                    onClick={() => setIsActive(!isActive)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isActive ? 'Sign In' : 'Sign Up'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
            
            <AlertPopup
                message={alert.message}
                type={alert.type}
                isVisible={alert.isVisible}
                onClose={() => setAlert({ ...alert, isVisible: false })}
            />
        </div>
    );
};

export default LoginSignup;
