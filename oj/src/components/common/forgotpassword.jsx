import { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import { FaEnvelope } from 'react-icons/fa';
import '../stylesheets/signup.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const FORGOT_PASSWORD_PATH = import.meta.env.VITE_FORGOT_PASSWORD_PATH;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await axios.post(FORGOT_PASSWORD_PATH, { email });
            setSuccessMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1>Reset Your Password</h1>
                    <p>Enter your email address to receive a reset link.</p>
                </div>
                <Form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <Form.Control type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </Form>
            </div>
        </div>
    );
};

export default ForgotPassword;

