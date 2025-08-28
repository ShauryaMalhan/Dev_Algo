import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLogin from '../admin/adminlogin';

const AdminProtectedRoute = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    // Use a ref to store the timer ID so it persists across re-renders
    const logoutTimer = useRef(null);

    // This effect handles the initial authentication check on load
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAdminAuthenticated(true);
        }
        setLoading(false);
    }, []);

    // This effect manages the inactivity timer on every navigation change
    useEffect(() => {
        const thirtyMinutes = 30 * 60 * 1000;

        // Check if the user is currently on an admin page
        if (location.pathname.startsWith('/admin')) {
            // If they are, clear any existing logout timer.
            if (logoutTimer.current) {
                clearTimeout(logoutTimer.current);
                logoutTimer.current = null;
            }
        } else {
            // If they are NOT on an admin page, start a new logout timer,
            // but only if there's a token to clear and no timer is already running.
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken && !logoutTimer.current) {
                logoutTimer.current = setTimeout(() => {
                    localStorage.removeItem('adminToken');
                    // You could add an alert here to notify the user
                    // alert("Your admin session has expired due to inactivity.");
                }, thirtyMinutes);
            }
        }
    }, [location]); // This effect re-runs whenever the location changes

    const handleLoginSuccess = () => {
        setIsAdminAuthenticated(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAdminAuthenticated ? children : <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

export default AdminProtectedRoute;
