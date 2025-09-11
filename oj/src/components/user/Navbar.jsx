import { useState, useEffect, useContext, useRef } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import axios from 'axios';
import "../stylesheets/navbar.css";
import authContext from "../../contexts/auth/authContext";
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Usernavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(authContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const dropdownRef = useRef(null);
    const isValid = user && user.username && user.username !== "none";
    const GET_PROFILE_PATH = import.meta.env.VITE_GET_PROFILE_PATH;

    useEffect(() => {
        const fetchProfilePicture = async () => {
            if (isValid) {
                try {
                    const response = await axios.get(`${GET_PROFILE_PATH}/${user.username}`);
                    if (response.data && response.data.profilePicture) {
                        setProfilePictureUrl(response.data.profilePicture);
                    } else {
                        setProfilePictureUrl('');
                    }
                } catch (error) {
                    console.error("Could not fetch profile picture", error);
                    setProfilePictureUrl('');
                }
            }
        };
        fetchProfilePicture();
    }, [user.username, GET_PROFILE_PATH, isValid]);
    
    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('authtoken');
        setUser({ username: "none" });
        setIsDropdownOpen(false);
        setProfilePictureUrl('');
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setIsDropdownOpen(false);
    }, [location]);

    const finalProfileImageUrl = profilePictureUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.username}`;

    return (
        <Navbar expand="lg" className="custom-navbar dark-theme sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="navbar-brand-custom">
                    Pi<span>Code</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/problems" className={location.pathname === "/problems" ? "active" : ""}>
                            Problem List
                        </Nav.Link>
                        {isValid && (
                            <Nav.Link as={Link} to="/mySubmissions" className={location.pathname === "/mySubmissions" ? "active" : ""}>
                                My Submissions
                            </Nav.Link>
                        )}
                        <Nav.Link as={Link} to="/allSubmissions" className={location.pathname === "/allSubmissions" ? "active" : ""}>
                            All Submissions
                        </Nav.Link>
                    </Nav>
                    <Nav className="ms-auto align-items-center">
                        {!isValid ? (
                            <div className="auth-buttons">
                                <Button as={Link} to="/login" className={location.pathname === '/login' ? 'nav-btn nav-btn-solid' : 'nav-btn nav-btn-outline'}>
                                    Login
                                </Button>
                                <Button as={Link} to="/signup" className={location.pathname === '/signup' ? 'nav-btn nav-btn-solid' : 'nav-btn nav-btn-outline'}>
                                    Signup
                                </Button>
                            </div>
                        ) : (
                            <div className="profile-section" ref={dropdownRef}>
                                <button className="profile-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                    <img src={finalProfileImageUrl} alt="Profile" />
                                </button>
                                {isDropdownOpen && (
                                    <div className="profile-dropdown">
                                        <div className="dropdown-header">
                                            <span>Signed in as</span>
                                            <strong>{user.username}</strong>
                                        </div>
                                        <Link to={`/profile/${user.username}`} className="dropdown-item">
                                            <FaUserCircle className="dropdown-icon" /> My Profile
                                        </Link>
                                        <button onClick={handleLogout} className="dropdown-item dropdown-logout">
                                            <FaSignOutAlt className="dropdown-icon" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Usernavbar;