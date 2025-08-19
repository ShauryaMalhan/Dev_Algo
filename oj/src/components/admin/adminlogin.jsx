import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/adminlogin.css';
import { FaUserShield, FaLock } from 'react-icons/fa';

const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.post(ADMIN_LOGIN_PATH, { email, password });
            
            if (response.data.authtoken) {
                localStorage.setItem('adminToken', response.data.authtoken);
                onLoginSuccess();
                navigate('/admin');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
            console.error("Admin login failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <FaUserShield className="header-icon" />
                    <h1>Admin Access</h1>
                    <p>This is your safe place.</p>
                </div>
                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaUserShield className="input-icon" />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="admin-login-button" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
