// In components/services/AdminProtectedRoute.jsx
import { useState, useEffect } from 'react';
import AdminLogin from '../admin/adminlogin';

const AdminProtectedRoute = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAdminAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLoginSuccess = () => {
        setIsAdminAuthenticated(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAdminAuthenticated ? children : <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

export default AdminProtectedRoute;