import { useState, useEffect, useContext } from "react";
import { Link } from 'react-router-dom';
import authContext from "../../contexts/auth/authContext";
import axios from "axios";
import "../stylesheets/submissions.css";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle, FaSync, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const MySubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(authContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    const MY_SUBMISSIONS_PATH = import.meta.env.VITE_MY_SUBMISSIONS_PATH;

    useEffect(() => {
        let intervalId;
        if (user && user.username !== "none") {
            const fetchMyHistory = async () => {
                try {
                    const response = await axios.get(MY_SUBMISSIONS_PATH, {
                        headers: { 'auth-token': localStorage.getItem('authtoken') },
                        params: { page: currentPage, limit: 50 }
                    });
                    
                    setSubmissions(response.data.submissions);
                    setTotalPages(response.data.totalPages);

                    const isPending = response.data.submissions.some(s => s.verdict === 'In Queue' || s.verdict === 'Judging');
                    if (!isPending && intervalId) {
                        clearInterval(intervalId);
                    }
                } catch (err) {
                    console.error("Failed to fetch submissions:", err);
                    setError("Failed to fetch your submissions.");
                    if (intervalId) clearInterval(intervalId);
                } finally {
                    if (currentPage === 1) setLoading(false);
                }
            };

            fetchMyHistory();
            intervalId = setInterval(fetchMyHistory, 3000);
        } else {
            setLoading(false);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user, MY_SUBMISSIONS_PATH, currentPage]);
    
    const createSlug = (problemName) => {
        if (!problemName) return 'unknown';
        return problemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    };

    const getVerdictIcon = (verdict) => {
        switch (verdict) {
            case 'Accepted':
                return <FaCheckCircle className="verdict-icon accepted" />;
            case 'Wrong Answer':
            case 'Error':
                return <FaTimesCircle className="verdict-icon wrong-answer" />;
            case 'Time Limit Exceeded':
                return <FaHourglassHalf className="verdict-icon time-limit-exceeded" />;
            case 'In Queue':
            case 'Judging':
                return <FaSync className="verdict-icon pending spin" />;
            default:
                return <FaExclamationTriangle className="verdict-icon other" />;
        }
    };
    
    const getVerdictClass = (verdict) => {
        if (!verdict) return 'other';
        return verdict.toLowerCase().replace(/\s+/g, '-');
    };

    if (loading) return <div className="loading-container">Loading submissions...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="submissions-container">
            <header className="submissions-header">
                <h1>My Submissions</h1>
                <p>A history of all your solutions.</p>
            </header>
            
            <div className="submissions-table-wrapper">
                <table className="submissions-table">
                    <thead>
                        <tr>
                            <th>Problem</th>
                            <th>Verdict</th>
                            <th>Language</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.map((sub) => (
                            <tr key={sub._id}>
                                <td data-label="Problem">
                                    <Link to={`/problems/${createSlug(sub.problem)}`}>{sub.problem || 'Unknown Problem'}</Link>
                                </td>
                                <td data-label="Verdict">
                                    <span className={`verdict-cell ${getVerdictClass(sub.verdict)}`}>
                                        {getVerdictIcon(sub.verdict)} {sub.verdict || 'N/A'}
                                    </span>
                                </td>
                                <td data-label="Language">{sub.language || 'N/A'}</td>
                                <td data-label="Submitted At">
                                    {sub.time ? new Date(sub.time).toLocaleString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {submissions.length === 0 && <div className="no-submissions">You haven't made any submissions yet.</div>}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        <FaArrowLeft /> Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        Next <FaArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MySubmissions;