import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Form from "react-bootstrap/Form";
import { FaUser, FaUserAstronaut, FaEnvelope, FaLock, FaKey, FaEye, FaEyeSlash } from "react-icons/fa";
import "../stylesheets/signup.css";

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        otp: '',
    });
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [timer, setTimer] = useState(300);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    
    const SEND_OTP_PATH = import.meta.env.VITE_SEND_OTP_PATH;  
    const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH;

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (timer === 0 && step === 2) {
            setApiError('OTP expired. Please try registering again.');
            setTimeout(() => { setStep(1); setApiError(''); setTimer(300); }, 3000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    useEffect(() => {
        let interval;
        if (resendCooldown > 0) {
            interval = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };
    
    const validateStep1 = () => {
        const newErrors = {};
        const nameRegex = /^[a-zA-Z]+$/;
        const noSpaceRegex = /^\S*$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!formData.firstName) newErrors.firstName = "First name is required.";
        else if (formData.firstName.length > 10) newErrors.firstName = "Max 10 characters.";
        else if (!nameRegex.test(formData.firstName)) newErrors.firstName = "Only letters are allowed.";
        
        if (!formData.lastName) newErrors.lastName = "Last name is required.";
        else if (formData.lastName.length > 10) newErrors.lastName = "Max 10 characters.";
        else if (!nameRegex.test(formData.lastName)) newErrors.lastName = "Only letters are allowed.";
        
        if (!formData.email) newErrors.email = "Email is required.";
        else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email.";

        if (!formData.username) newErrors.username = "Username is required.";
        else if (formData.username.length < 5 || formData.username.length > 10) newErrors.username = "Must be 5-10 characters.";
        else if (!noSpaceRegex.test(formData.username)) newErrors.username = "Spaces are not allowed.";
        
        if (!formData.password) newErrors.password = "Password is required.";
        else if (formData.password.length < 6 || formData.password.length > 13) newErrors.password = "Must be 6-13 characters.";
        else if (!noSpaceRegex.test(formData.password)) newErrors.password = "Spaces are not allowed.";
        
        return newErrors;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const validationErrors = validateStep1();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setLoading(true);
        setApiError('');
        
        try {
            await axios.post(SEND_OTP_PATH, { 
                email: formData.email,
                username: formData.username
            });
            setStep(2);
            setTimer(300);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError('');
        
        const registrationData = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            username: formData.username,
            email: formData.email,
            password: formData.password,
            otp: formData.otp,
        };

        try {
            await axios.post(REGISTER_PATH, registrationData);
            setSuccessMessage('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Registration failed.');
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
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Create Your Account</h1>
                        <p>Join the community and start your coding journey</p>
                    </div>
                    <Form className="auth-form" onSubmit={handleSendOtp} noValidate>
                        <div className="form-name-row">
                            <div className="form-group">
                                <div className="input-group">
                                    <FaUser className="input-icon" />
                                    <Form.Control type="text" name="firstName" placeholder="First Name" onChange={handleInputChange} isInvalid={!!errors.firstName} maxLength="10" required />
                                </div>
                                <div className="error-message-container">
                                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-group">
                                    <FaUser className="input-icon" />
                                    <Form.Control type="text" name="lastName" placeholder="Last Name" onChange={handleInputChange} isInvalid={!!errors.lastName} maxLength="10" required />
                                </div>
                                <div className="error-message-container">
                                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <FaUserAstronaut className="input-icon" />
                                <Form.Control type="text" name="username" placeholder="Username" onChange={handleInputChange} isInvalid={!!errors.username} minLength="5" maxLength="10" required />
                            </div>
                            <div className="error-message-container">
                                {errors.username && <span className="error-text">{errors.username}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <FaEnvelope className="input-icon" />
                                <Form.Control type="email" name="email" placeholder="Email Address" onChange={handleInputChange} isInvalid={!!errors.email} required />
                            </div>
                             <div className="error-message-container">
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <FaLock className="input-icon" />
                                <Form.Control type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleInputChange} isInvalid={!!errors.password} minLength="6" maxLength="13" required />
                                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                            </div>
                            <div className="error-message-container">
                                {errors.password && <span className="error-text">{errors.password}</span>}
                            </div>
                        </div>
                        {apiError && <p className="api-error-message">{apiError}</p>}
                        <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Sending...' : 'Send Verification Code'}</button>
                    </Form>
                    <div className="auth-footer">Already have an account? <Link to="/login">Log In</Link></div>
                </div>
            )}

            {step === 2 && (
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Verify Your Email</h1>
                        <p>A 6-digit code has been sent to {formData.email}.</p>
                        <p className="timer">Time remaining: {formatTime(timer)}</p>
                    </div>
                    <Form className="auth-form" onSubmit={handleRegister}>
                        <div className="input-group">
                            <FaKey className="input-icon" />
                            <Form.Control type="text" name="otp" placeholder="Enter OTP" onChange={handleInputChange} required minLength="6" maxLength="6" />
                        </div>
                        {apiError && <p className="api-error-message">{apiError}</p>}
                        {successMessage && <p className="success-message">{successMessage}</p>}
                        <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Verifying...' : 'Create Account'}</button>
                    </Form>
                </div>
            )}
        </div>
    );
};

export default Signup;