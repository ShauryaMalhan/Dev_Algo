import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../stylesheets/signup.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef(null);

    const RESET_PASSWORD_PATH = import.meta.env.VITE_RESET_PASSWORD_PATH;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        passwordInputRef.current.focus();
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await axios.post(`${RESET_PASSWORD_PATH}/${token}`, { password });
            setSuccessMessage('Password has been reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Set a New Password</h1>
                    <p>Enter your new password below.</p>
                </div>
                <Form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <Form.Control 
                            ref={passwordInputRef}
                            type={showPassword ? "text" : "password"} 
                            placeholder="New Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        <button type="button" className="password-toggle-btn" onClick={togglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                     <div className="input-group">
                        <FaLock className="input-icon" />
                        <Form.Control 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Confirm New Password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Saving...' : 'Set New Password'}
                    </button>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;
