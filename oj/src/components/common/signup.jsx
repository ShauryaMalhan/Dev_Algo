import { Link, useNavigate } from "react-router-dom";
import "../stylesheets/signup.css";
import Form from "react-bootstrap/Form";
import { useState } from "react";
import Alert from "../services/alert";
import { FaUser, FaUserAstronaut, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [name, setFullname] = useState("");
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isValid =
        email.length > 5 &&
        password.length > 5 &&
        username.length > 5 &&
        name.length > 5 &&
        email.endsWith("@gmail.com");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.endsWith("@gmail.com")) {
            setAlertMessage('Please use a verified Gmail account to register.');
            setShowAlert(true);
            return;
        }
        try {
            const REGISTER_URL = import.meta.env.VITE_REGISTER_PATH;
            const response = await fetch(REGISTER_URL, {
                method: 'POST',
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name, username, email, password })
            });
            const result = await response.json();
            if (!response.ok) {
                setAlertMessage('Signup failed, please try again');
                setShowAlert(true);
                throw new Error(result.error);
            }
            navigate('/login');
        } catch (err) {
            setShowAlert(true);
            setAlertMessage('Signup failed, please try again');
            console.error(err);
        }
    };

    return (
        <>
            <div className="auth-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <h1>Create Your Account</h1>
                        <p>Join the community and start your coding journey</p>
                    </div>

                    <Form className="auth-form" onSubmit={handleSubmit}>
                        <div className="input-group">
                            <FaUser className="input-icon" />
                            <Form.Control
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setFullname(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <FaUserAstronaut className="input-icon" />
                            <Form.Control
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <FaEnvelope className="input-icon" />
                            <Form.Control
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <FaLock className="input-icon" />
                            <Form.Control
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <button type="submit" className="auth-button" disabled={!isValid}>
                           &gt; Register
                        </button>
                    </Form>

                    <div className="auth-footer">
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link">
                            Log In
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

export default Signup;