import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProblems } from "../services/problems.jsx";
import '../stylesheets/problems.css';
import { FaCheckCircle, FaRegCircle, FaTimesCircle } from 'react-icons/fa';

const Problem = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("All");

    useEffect(() => {
        const getData = async () => {
            try {
                const problemData = await fetchProblems();
                const formattedProblems = problemData.map(p => ({ ...p, title: p.name }));
                setProblems(formattedProblems);
            } catch (err) {
                console.error("Failed to fetch problems:", err);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    const handleRowClick = (problem) => {
        navigate(`/problems/${problem.slug}`);
    };

    const filteredProblems = problems
        .filter(p => difficultyFilter === "All" || p.difficulty === difficultyFilter)
        .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const StatusIcon = ({ status }) => {
        if (status === "Solved") return <FaCheckCircle className="status-icon solved" title="Solved" />;
        if (status === "Attempted") return <FaTimesCircle className="status-icon attempted" title="Attempted" />;
        return <FaRegCircle className="status-icon todo" title="Todo" />;
    };

    return (
        <div className="problems-page-container">
            <div className="problems-header">
                <h1>Problemset</h1>
                <div className="actions-container">
                    <div className="filter-buttons">
                        <button onClick={() => setDifficultyFilter("All")} className={difficultyFilter === 'All' ? 'active' : ''}>All</button>
                        <button onClick={() => setDifficultyFilter("Easy")} className={difficultyFilter === 'Easy' ? 'active' : ''}>Easy</button>
                        <button onClick={() => setDifficultyFilter("Medium")} className={difficultyFilter === 'Medium' ? 'active' : ''}>Medium</button>
                        <button onClick={() => setDifficultyFilter("Hard")} className={difficultyFilter === 'Hard' ? 'active' : ''}>Hard</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="search-bar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-container">Loading problems...</div>
            ) : (
                <div className="table-container">
                    <table className="problems-table">
                        <thead>
                            <tr>
                                <th className="status-col">Status</th>
                                <th className="title-col">Title</th>
                                <th className="difficulty-col">Difficulty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProblems.map((problem) => (
                                <tr key={problem._id} onClick={() => handleRowClick(problem)}>
                                    <td data-label="Status" className="status-col">
                                        <StatusIcon status={problem.status} />
                                    </td>
                                    <td data-label="Title" className="title-col">{problem.title}</td>
                                    <td data-label="Difficulty" className="difficulty-col">
                                        <span className={`difficulty-tag difficulty-${(problem.difficulty || '').toLowerCase()}`}>
                                            {problem.difficulty || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Problem;