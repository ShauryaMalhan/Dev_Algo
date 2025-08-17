import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import "../stylesheets/dashboard.css";

// Import cool icons from react-icons
import { FaCheckCircle, FaCode, FaChartLine, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const Dashboard = () => {
    const { user } = useContext(authContext);

    // --- Mock Data (replace with API calls later) ---
    const stats = [
        { icon: <FaCheckCircle />, value: "128", label: "Problems Solved" },
        { icon: <FaCode />, value: "350", label: "Total Submissions" },
        { icon: <FaChartLine />, value: "82%", label: "Submission Accuracy" }
    ];

    const recentSubmissions = [
        { id: 1, name: "Two Sum", verdict: "Accepted", icon: <FaCheckCircle className="verdict-icon accepted"/>, time: "5m ago" },
        { id: 2, name: "Longest Substring", verdict: "Wrong Answer", icon: <FaTimesCircle className="verdict-icon wa"/>, time: "1h ago" },
        { id: 3, name: "Median of Two Sorted Arrays", verdict: "Time Limit Exceeded", icon: <FaHourglassHalf className="verdict-icon tle"/>, time: "3h ago" },
        { id: 4, name: "Reverse Integer", verdict: "Accepted", icon: <FaCheckCircle className="verdict-icon accepted"/>, time: "Yesterday" }
    ];
    // --- End of Mock Data ---

    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12
            ? "Good Morning"
            : currentHour < 18
            ? "Good Afternoon"
            : "Good Evening";

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>{greeting}, <span className="username">{user.username}</span>!</h1>
                <p>Ready to solve some problems?</p>
            </div>

            {/* --- Stats Grid --- */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* --- Recent Activity --- */}
            <div className="recent-activity">
                <h2>Recent Submissions</h2>
                <ul className="submission-list">
                    {recentSubmissions.map((sub) => (
                        <li className="submission-item" key={sub.id}>
                            <div className="submission-info">
                                {sub.icon}
                                <span className="problem-name">{sub.name}</span>
                            </div>
                            <div className="submission-details">
                                <span className={`verdict ${sub.verdict.toLowerCase().replace(/\s/g, '-')}`}>{sub.verdict}</span>
                                <span className="submission-time">{sub.time}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;