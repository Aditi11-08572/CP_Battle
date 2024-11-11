import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './loginsignup.module.css'; // Changed import to use CSS module
import axios from 'axios';
import AlertPopup from '../components/AlertPopup';

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

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div className={styles.body01}>
            <AlertPopup
                message={alert.message}
                type={alert.type}
                isVisible={alert.isVisible}
                onClose={() => setAlert({ ...alert, isVisible: false })}
            />
            <div className={`${styles.container01} ${isActive ? styles.active : ''}`} id="container">
                <div className={`${styles['form-container']} ${styles['sign-up']}`}>
                    <form onSubmit={handleSignup}>
                        <h1>Create Account</h1>
                        <div className={styles['social-icons']}>
                            <a href="#" className={styles.social}><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className={styles.social}><i className="fa-brands fa-google"></i></a>
                            <a href="#" className={styles.social}><i className="fa-brands fa-github"></i></a>
                            <a href="#" className={styles.social}><i className="fab fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your email for registration</span>
                        <input type="text" name="name" placeholder="Name" required onChange={(e) => setName(e.target.value)} />
                        <input type="email" name="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" name="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
                        <input type="text" name="codeforcesId" placeholder="Codeforces ID" required onChange={(e) => setCodeforcesId(e.target.value)} />
                        {error && <p className={styles.error}>{error}</p>}
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
                <div className={`${styles['form-container']} ${styles['sign-in']}`}>
                    <form onSubmit={handleLogin}>
                        <h1>Sign In</h1>
                        <div className={styles['social-icons']}>
                            <a href="#" className={styles.social}><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className={styles.social}><i className="fa-brands fa-google"></i></a>
                            <a href="#" className={styles.social}><i className="fa-brands fa-github"></i></a>
                            <a href="#" className={styles.social}><i className="fab fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your email password</span>
                        <input type="email" name="email" placeholder="Email" required />
                        <input type="password" name="password" placeholder="Password" required />
                        <Link to="/forgot-password">Forgot your password?</Link>
                        <button type="submit">Sign In</button>
                    </form>
                </div>
                <div className={styles['toggle-container']}>
                    <div className={styles.toggle}>
                        <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button className={styles.hidden} id="login">Sign In</button>
                        </div>
                        <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <button className={styles.hidden} id="register">Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
