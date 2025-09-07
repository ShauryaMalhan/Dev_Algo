import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../stylesheets/submissions.css';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle } from 'react-icons/fa';

const AllSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const ALL_SUBMISSION_PATH = import.meta.env.VITE_ALL_SUBMISSIONS_PATH;

    useEffect(() => {
        const fetchAllHistory = async () => {
            try {
                const response = await axios.get(ALL_SUBMISSION_PATH);
                setSubmissions(response.data);
            } catch (err) {
                console.error("Failed to fetch all submissions:", err);
                setError('Failed to fetch submissions.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllHistory();
    }, [ALL_SUBMISSION_PATH]);

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
                <h1>All Submissions</h1>
                <p>View the latest submissions from the community.</p>
            </header>

            <div className="submissions-table-wrapper">
                <table className="submissions-table">
                    <thead>
                        <tr>
                            <th>Problem</th>
                            <th>User</th>
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
                                <td data-label="User">
                                    <Link to={`/profile/${sub.user}`}>{sub.user || 'Unknown User'}</Link>
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
                 {submissions.length === 0 && <div className="no-submissions">No submissions found.</div>}
            </div>
        </div>
    );
};

export default AllSubmissions;