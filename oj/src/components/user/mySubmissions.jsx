import { useEffect, useState, useContext } from "react";
import authContext from "../../contexts/auth/authContext";
import axios from "axios";
import "../stylesheets/submissions.css";

const MySubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(authContext);
    const mySubmissionsURL = import.meta.env.VITE_MY_SUBMISSIONS_PATH;

    useEffect(() => {
        // We only run this effect if the username is valid (not "none")
        if (user.username !== "none") {
            const myHistory = async () => {
                try {
                    // UPDATED: Changed to a GET request with query parameters
                    const response = await axios.get(mySubmissionsURL, {
                        params: { user: user.username }
                    });
                    // The backend now sorts the data, so .reverse() is not needed
                    setSubmissions(response.data);
                } catch (err) {
                    console.error("Failed to fetch submissions:", err);
                } finally {
                    setLoading(false);
                }
            };
            myHistory();
        }
    }, [user.username, mySubmissionsURL]);

    // Helper function to format the verdict class name
    const getVerdictClass = (verdict) => {
        return verdict.toLowerCase().replace(/\s+/g, '-');
    };

    return (
        <div className="submissions-page-container">
            <h1 className="page-header">My Submissions</h1>
            {loading ? (
                <div className="loading-message">Loading submissions...</div>
            ) : (
                <div className="table-container">
                    {submissions.length > 0 ? (
                        <table className="submissions-table">
                            <thead>
                                <tr>
                                    <th>Submitted At</th>
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

export default MySubmissions;