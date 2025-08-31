import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import { FaUser, FaUserAstronaut, FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../stylesheets/signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        otp: '',
    });
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [timer, setTimer] = useState(300);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef(null);

    const SEND_OTP_PATH = import.meta.env.VITE_SEND_OTP_PATH; 
    const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH;

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && step === 2) {
            setError('OTP expired. Please try registering again.');
            setTimeout(() => {
                setStep(1);
                setError('');
                setTimer(300);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    useEffect(() => {
        if (successMessage) {
            const messageTimer = setTimeout(() => {
                setSuccessMessage('');
            }, 5000);

            return () => clearTimeout(messageTimer);
        }
    }, [successMessage]);

    useEffect(() => {
        let interval;
        if (resendCooldown > 0) {
            interval = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

     const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        passwordInputRef.current.focus();
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(SEND_OTP_PATH, { email: formData.email });
            setStep(2);
            setTimer(300);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. The email might already be registered.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            await axios.post(SEND_OTP_PATH, { email: formData.email });
            setSuccessMessage('A new OTP has been sent.');
            setTimer(300);
            setResendCooldown(60);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(REGISTER_PATH, formData);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check the OTP.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="auth-container">
            {step === 1 && (
                <div className="signup-card">
                    <div className="signup-header">
                        <h1>Create Your Account</h1>
                        <p>Join the community and start your coding journey</p>
                    </div>
                    <Form className="auth-form" onSubmit={handleSendOtp}>
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <Form.Control type="text" name="name" placeholder="Full Name" onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <FaUserAstronaut className="input-icon" />
                            <Form.Control type="text" name="username" placeholder="Username / Handle" onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <Form.Control type="email" name="email" placeholder="Email Address" onChange={handleInputChange} required />
                        </div>
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <Form.Control
                                ref={passwordInputRef}
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                onChange={handleInputChange}
                                required
                            />
                            <button type="button" className="password-toggle-btn" onClick={togglePasswordVisibility} >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </Form>
                    <div className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Log In</Link>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="signup-card">
                    <div className="signup-header">
                        <h1>Verify Your Email</h1>
                        <p>A 6-digit code has been sent to {formData.email}.</p>
                        <p className="timer">Time remaining: {formatTime(timer)}</p>
                    </div>
                    <Form className="auth-form" onSubmit={handleRegister}>
                        <div className="input-group">
                            <FaKey className="input-icon" />
                            <Form.Control type="text" name="otp" placeholder="Enter OTP" onChange={handleInputChange} required minLength="6" maxLength="6" />
                        </div>
                        {error && <p className="error-message">{error}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}
                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Verifying...' : 'Create Account'}
                        </button>
                        <div className="resend-container">
                            <button type="button" className="auth-link back-link" onClick={() => setStep(1)}>Back</button>
                            <button type="button" className="auth-link resend-link" onClick={handleResendOtp} disabled={resendCooldown > 0}>
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default Signup;

