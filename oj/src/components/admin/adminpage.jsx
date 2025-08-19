import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCog, FaUsers } from 'react-icons/fa';
import '../stylesheets/adminpage.css';

const AdminPage = () => {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);
    const GET_ADMIN_PATH = import.meta.env.VITE_GET_ADMIN_PATH;

    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) return;

                const response = await axios.get(GET_ADMIN_PATH, {
                    headers: { 'auth-token': token }
                });
                setAdminUser(response.data);
            } catch (error) {
                console.error("Failed to fetch admin details:", error);
            }
        };
        fetchAdminDetails();
    }, [GET_ADMIN_PATH]);

    const handleManageProblems = () => {
        navigate('/admin/manage-problems');
    };

    const handleManageUsers = () => {
        navigate('/admin/manage-users');
    };

    return (
        <div className="admin-page-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="header-actions">
                    <button className="header-btn" onClick={handleManageProblems}>
                        <FaCog /> Manage Problems
                    </button>
                    <button className="header-btn" onClick={handleManageUsers}>
                        <FaUsers /> Manage Users
                    </button>
                </div>
            </div>

            <div className="content-panel">
                <h2>Welcome, {adminUser ? adminUser.username : 'Admin'}!</h2>
                <p>Select an option from the top to get started.</p>
            </div>
        </div>
    );
};

export default AdminPage;
