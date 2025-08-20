import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaListUl, FaVial, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaPen } from 'react-icons/fa';
import '../stylesheets/manageproblem.css';

const ManageProblems = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('cards'); 
    
    const [allProblems, setAllProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 10;
    const GET_ALL_PROBLEMS_PATH = import.meta.env.VITE_GET_ALL_PROBLEMS_PATH;

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const response = await axios.get(GET_ALL_PROBLEMS_PATH);
                const problemsData = response.data.map(p => ({ ...p, title: p.name }));
                setAllProblems(problemsData);
                setFilteredProblems(problemsData);
            } catch (error) {
                console.error("Failed to fetch problems:", error);
            }
        };
        fetchProblems();
    }, [GET_ALL_PROBLEMS_PATH]);

    useEffect(() => {
        const results = allProblems.filter(problem =>
            problem.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProblems(results);
        setCurrentPage(1);
    }, [searchTerm, allProblems]);

    // Pagination logic
    const indexOfLastProblem = currentPage * problemsPerPage;
    const indexOfFirstProblem = indexOfLastProblem - problemsPerPage;
    const currentProblems = filteredProblems.slice(indexOfFirstProblem, indexOfLastProblem);
    const totalPages = Math.ceil(filteredProblems.length / problemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
        <div className="manage-problems-container">
            <h1>Problem Management</h1>
            <div className="management-options">
                <div className="option-card" onClick={() => setView('problemlist')}>
                    <FaListUl className="option-icon" />
                    <h2>Edit Problem List</h2>
                    <p>Create, view, edit, or delete problem statements.</p>
                </div>
                <div className="option-card" onClick={() => setView('testcaselist')}>
                    <FaVial className="option-icon" />
                    <h2>Edit Test Cases</h2>
                    <p>Add, edit, or delete test cases for problems.</p>
                </div>
            </div>

            {/* --- View 1: Problem List Table --- */}
            {view === 'problemlist' && (
                <div className="problemlist-section">
                    <div className="problemlist-header">
                        <h2>All Problems</h2>
                        <div className="problemlist-actions">
                            <div className="search-container">
                                <FaSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="create-btn" onClick={() => navigate('/admin/new-problem')}>
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="problems-table">
                            <thead>
                                <tr>
                                    <th className="title-col">Title</th>
                                    <th className="difficulty-col">Difficulty</th>
                                    <th className="owner-col">Owner</th>
                                    <th className="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProblems.map((problem) => (
                                    <tr key={problem._id}>
                                        <td className="title-col">
                                            <Link to={`/problems/${problem.slug}`} className="problem-title-link">
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className="difficulty-col">
                                            <span className={`difficulty-tag difficulty-${(problem.difficulty || '').toLowerCase()}`}>
                                                {problem.difficulty || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="owner-col">{problem.owner}</td>
                                        <td className="actions-col">
                                            <button className="action-btn edit-btn" onClick={() => navigate(`/admin/edit-problem/${problem._id}`)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-controls">
                        <button onClick={handlePrevPage} disabled={currentPage === 1}><FaChevronLeft /></button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}><FaChevronRight /></button>
                    </div>
                </div>
            )}

            {/* --- View 2: Test Case List Table --- */}
            {view === 'testcaselist' && (
                 <div className="problemlist-section">
                    <div className="problemlist-header">
                        <h2>Manage Test Cases</h2>
                        <div className="search-container">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="problems-table">
                            <thead>
                                <tr>
                                    <th className="title-col">Title</th>
                                    <th className="difficulty-col">Difficulty</th>
                                    <th className="owner-col">Owner</th>
                                    <th className="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProblems.map((problem) => (
                                    <tr key={problem._id}>
                                        <td className="title-col">
                                            <Link to={`/problems/${problem.slug}`} className="problem-title-link">
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className="difficulty-col">
                                            <span className={`difficulty-tag difficulty-${(problem.difficulty || '').toLowerCase()}`}>
                                                {problem.difficulty || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="owner-col">{problem.owner}</td>
                                        <td className="actions-col">
                                            <button className="action-btn edit-btn">
                                                <FaPen /> Edit Test Cases
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="pagination-controls">
                        <button onClick={handlePrevPage} disabled={currentPage === 1}><FaChevronLeft /></button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}><FaChevronRight /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProblems;
