import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../stylesheets/createproblem.css';

const checkerOptions = [
    'No checker', 'fcmp.cpp', 'hcmp.cpp', 'lcmp.cpp', 'ncmp.cpp',
    'nyesno.cpp', 'rcmp4.cpp', 'rcmp6.cpp', 'rcmp9.cpp',
    'wcmp.cpp', 'yesno.cpp'
];
const difficultyOptions = ['Easy', 'Medium', 'Hard'];

const EditProblem = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [problem, setProblem] = useState(null);
    const [error, setError] = useState('');

    const EDIT_PROBLEMS = import.meta.env.VITE_ADMIN_GET_ALL_PROBLEMS_PATH;

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await axios.get(`${EDIT_PROBLEMS}/${id}`, {
                    headers: { 'auth-token': localStorage.getItem('adminToken') }
                });
                setProblem(response.data);
            } catch (err) {
                setError('Failed to load problem data.');
                console.error(err);
            }
        };
        fetchProblem();
    }, [id, EDIT_PROBLEMS]);

    const createSlug = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newProblem = { ...problem, [name]: value };
        if (name === 'name') {
            newProblem.slug = createSlug(value);
        }
        setProblem(newProblem);
    };

    const handleQuillChange = (fieldName, value) => {
        setProblem({ ...problem, [fieldName]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.put(`${EDIT_PROBLEMS}/${id}`, problem, {
                headers: { 'auth-token': localStorage.getItem('adminToken') }
            });
            navigate('/admin/manage-problems');
        } catch (err) {
            setError('Failed to update problem.');
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this problem?')) {
            try {
                await axios.delete(`${EDIT_PROBLEMS}/${id}`, {
                    headers: { 'auth-token': localStorage.getItem('adminToken') }
                });
                navigate('/admin/manage-problems');
            } catch (err) {
                setError('Failed to delete problem.');
                console.error(err);
            }
        }
    };

    if (!problem) return <div className="loading-container">Loading problem...</div>;

    return (
        <div className="create-problem-container">
            <div className="form-header">
                <h1>Edit Problem</h1>
                <button type="button" className="delete-btn-page" onClick={handleDelete}>
                    Delete Problem
                </button>
            </div>
            <form onSubmit={handleSubmit} className="problem-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Problem Name</label>
                        <input type="text" id="name" name="name" value={problem.name} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulty</label>
                        <select id="difficulty" name="difficulty" value={problem.difficulty} onChange={handleInputChange}>
                            {difficultyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="timeLimit">Time Limit (s)</label>
                        <input type="number" id="timeLimit" name="timeLimit" value={problem.timeLimit} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="memoryLimit">Memory Limit (MB)</label>
                        <input type="number" id="memoryLimit" name="memoryLimit" value={problem.memoryLimit || 256} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group full-width">
                        <label htmlFor="checker">Checker</label>
                        <select id="checker" name="checker" value={problem.checker} onChange={handleInputChange}>
                            {checkerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Legend (Problem Statement)</label>
                    <ReactQuill theme="snow" value={problem.legend} onChange={(val) => handleQuillChange('legend', val)} />
                </div>
                <div className="form-group">
                    <label>Input Description</label>
                    <ReactQuill theme="snow" value={problem.input} onChange={(val) => handleQuillChange('input', val)} />
                </div>
                <div className="form-group">
                    <label>Output Description</label>
                    <ReactQuill theme="snow" value={problem.output} onChange={(val) => handleQuillChange('output', val)} />
                </div>
                <div className="form-group">
                    <label>Notes</label>
                    <ReactQuill theme="snow" value={problem.notes} onChange={(val) => handleQuillChange('notes', val)} />
                </div>

                {error && <p className="error-message-form">{error}</p>}
                <button type="submit" className="submit-btn">Update Problem</button>
            </form>
        </div>
    );
};

export default EditProblem;