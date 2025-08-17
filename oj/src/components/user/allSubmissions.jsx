import { useEffect, useState } from "react";
import axios from "axios";
import "../stylesheets/submissions.css";

const AllSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const allSubmissionsURL = import.meta.env.VITE_ALL_SUBMISSIONS_PATH;

    useEffect(() => {
        const fetchAllHistory = async () => {
            try {
                // UPDATED: Changed to a GET request
                const response = await axios.get(allSubmissionsURL);
                // The backend now sorts the data, so .reverse() is not needed
                setSubmissions(response.data);
            } catch (err) {
                console.error("Failed to fetch all submissions:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllHistory();
    }, [allSubmissionsURL]);

    // Helper function to format the verdict class name
    const getVerdictClass = (verdict) => {
        return verdict.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <div className="submissions-page-container">
            <h1 className="page-header">All Submissions</h1>
            {loading ? (
                <div className="loading-message">Loading submissions...</div>
            ) : (
                <div className="table-container">
                    {submissions.length > 0 ? (
                        <table className="submissions-table">
                            <thead>
                                <tr>
                                    <th>Submitted At</th>
                                    <th>User</th> {/* Added User column */}
                                    <th>Problem</th>
                                    <th>Status</th>
                                    <th>Language</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub) => (
                                    <tr key={sub._id}>
                                        <td>
                                            <div className="time-cell">
                                                <span>{new Date(sub.time).toLocaleDateString()}</span>
                                                <span className="time-secondary">{new Date(sub.time).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="problem-title">{sub.user}</td> {/* Display the user */}
                                        <td className="problem-title">{sub.problem}</td>
                                        <td>
                                            <span className={`verdict-tag ${getVerdictClass(sub.verdict)}`}>
                                                {sub.verdict}
                                            </span>
                                        </td>
                                        <td>{sub.language}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-submission">No submissions found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AllSubmissions;