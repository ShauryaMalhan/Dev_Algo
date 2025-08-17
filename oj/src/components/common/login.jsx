import "../stylesheets/login.css";
import { Link, useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useState, useContext, useRef } from "react";
import authContext from "../../contexts/auth/authContext";
import Alert from "../services/alert";
import { FaUserAstronaut, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(authContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    // --- NEW: State and Ref for password visibility ---
    const [showPassword, setShowPassword] = useState(false);
    const passwordInputRef = useRef(null);

    const isValid = email.length > 5 && password.length > 5;

    // --- NEW: Toggle function ---
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
        passwordInputRef.current.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const LOGIN_URL = import.meta.env.VITE_LOGIN_PATH;
            const response = await fetch(LOGIN_URL, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok) {
                setAlertMessage('Login with correct credentials');
                setShowAlert(true);
                throw new Error(result.error);
            }
            localStorage.setItem('username', result.username);
            setUser({ username: result.username });
            navigate('/');
        } catch (err) {
            console.error(err);
            setAlertMessage('Login with correct credentials');
            setShowAlert(true);
        }
    };

    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12 ? "Good Morning, Coder." :
        currentHour < 18 ? "Good Afternoon, Coder." :
        "Good Evening, Coder.";

    return (
        <>
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
                                placeholder="Email / Handle"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* --- UPDATED: Password Input --- */}
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <Form.Control
                                ref={passwordInputRef} // Attach the ref
                                type={showPassword ? "text" : "password"} // Dynamic type
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {/* --- NEW: Toggle Button --- */}
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button type="submit" className="auth-button" disabled={!isValid}>
                           &gt; Authenticate
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
            {showAlert && (
                <Alert
                    message={alertMessage}
                    onClose={() => setShowAlert(false)}
                />
            )}
        </>
    );
};

export default Login;