import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AdminLogin from '../admin/adminlogin';

const AdminProtectedRoute = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const logoutTimer = useRef(null);
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAdminAuthenticated(true);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const thirtyMinutes = 30 * 60 * 1000;

        if (logoutTimer.current) {
            clearTimeout(logoutTimer.current);
            logoutTimer.current = null;
        }
        return () => {
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                logoutTimer.current = setTimeout(() => {
                    localStorage.removeItem('adminToken');
                }, thirtyMinutes);
            }
        };
    }, [location]);

    const handleLoginSuccess = () => {
        setIsAdminAuthenticated(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAdminAuthenticated ? children : <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

export default AdminProtectedRoute;
