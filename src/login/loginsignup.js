import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './loginsignup.module.css'; // Changed import to use CSS module
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';
import { motion } from 'framer-motion';

const LoginSignup = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [codeforcesId, setCodeforcesId] = useState(''); // New state for Codeforces ID
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
                showAlert(data.message, 'error'); // Changed from alert() to showAlert()
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('An error occurred during login', 'error'); // Changed from alert() to showAlert()
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
        <motion.div 
            className={styles.body01}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Add particles */}
            <div className={styles.particles}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={styles.particle} 
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 15}s`
                        }}
                    />
                ))}
            </div>

            <motion.div 
                className={`${styles.container01} ${isActive ? styles.active : ''}`}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Sign Up Form */}
                <motion.div 
                    className={`${styles['form-container']} ${styles['sign-up']}`}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: isActive ? 0 : 300, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Keep existing form content but wrap inputs in motion.div */}
                    <form onSubmit={handleSignup}>
                        <motion.h1
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            Create Account
                        </motion.h1>
                        
                        {/* Add social icons with animations */}
                        <div className={styles['social-icons']}>
                            <a href="#" className={styles.social}><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className={styles.social}><i className="fa-brands fa-google"></i></a>
                            <a href="#" className={styles.social}><i className="fa-brands fa-github"></i></a>
                            <a href="#" className={styles.social}><i className="fab fa-linkedin-in"></i></a>
                        </div>

                        {/* Add animated input fields */}
                        <motion.div className={styles.inputGroup}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <input type="text" name="name" placeholder="Name" required onChange={(e) => setName(e.target.value)} />
                            <input type="email" name="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                            <input type="password" name="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                            <input type="text" name="codeforcesId" placeholder="Codeforces ID" required onChange={(e) => setCodeforcesId(e.target.value)} />
                        </motion.div>

                        <motion.button 
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Sign Up
                        </motion.button>
                    </form>
                </motion.div>

                {/* Similar updates for Sign In form */}
                
                {/* Toggle Container */}
                <div className={styles['toggle-container']}>
                    <motion.div 
                        className={styles.toggle}
                        animate={{ x: isActive ? '50%' : '0%' }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={styles['toggle-panel']} ${styles['toggle-left']}}>
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button className={styles.hidden} id="login">Sign In</button>
                        </div>
                        <div className={styles['toggle-panel']} ${styles['toggle-right']}}>
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <button className={styles.hidden} id="register">Sign Up</button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LoginSignup;