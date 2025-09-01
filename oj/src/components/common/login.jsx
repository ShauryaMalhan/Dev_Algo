import "../stylesheets/login.css";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useState, useContext, useRef } from "react";
import authContext from "../../contexts/auth/authContext";
import { FaUserAstronaut, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(authContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef(null);

    const isValid = email.length > 5 && password.length > 5;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        passwordInputRef.current.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const LOGIN_URL = import.meta.env.VITE_LOGIN_PATH;
            const response = await axios.post(LOGIN_URL, { email, password });
            
            const result = response.data;

            if (result.authtoken) {
                localStorage.setItem('username', result.username);
                localStorage.setItem('authtoken', result.authtoken);
                
                setUser({ username: result.username });
                navigate('/');
            } else {
                setError('Login failed: No token received.');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12 ? "Good Morning, Coder." :
        currentHour < 18 ? "Good Afternoon, Coder." :
        "Good Evening, Coder.";

    return (
        <div className="auth-container">
            <div className="greeting-container">
                <h1 className="typing-effect">{greeting}</h1>
                <p className="fade-in-effect">Do. Or do not. There is no try.</p>
            </div>

            <div className="login-card">
                <Form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaUserAstronaut className="input-icon" />
                        <Form.Control
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <Form.Control
                            ref={passwordInputRef}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="forgot-password-link">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="auth-button" disabled={!isValid || loading}>
                        {loading ? 'Authenticating...' : '> Authenticate'}
                    </button>
                </Form>

                <div className="auth-footer">
                    New user?{" "}
                    <Link to="/signup" className="auth-link">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
