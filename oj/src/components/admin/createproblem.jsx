import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateProblem = () => {
    const navigate = useNavigate();
    const [problem, setProblem] = useState({
        name: '',
        slug: '',
        owner: '',
        timeLimit: 2,
        difficulty: 'Easy',
        legend: '',
        input: '',
        output: '',
        notes: '',
        checker: 'No checker'
    });
    const [error, setError] = useState('');
    
    const NEW_PROBLEM_PATH = import.meta.env.VITE_NEW_PROBLEM_PATH;
    const GET_ADMIN_PATH = import.meta.env.VITE_GET_ADMIN_PATH;

    useEffect(() => {
        const fetchAdminDetails = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await axios.get(GET_ADMIN_PATH, {
                    headers: { 'auth-token': token }
                });
                setProblem(p => ({ ...p, owner: response.data.username }));
            } catch (err) {
                console.error("Failed to fetch admin details", err);
            }
        };
        fetchAdminDetails();
    }, []);

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
            console.log(problem);
            await axios.post(NEW_PROBLEM_PATH, problem, {
                headers: { 'auth-token': localStorage.getItem('adminToken') }
            });
            navigate('/admin/manage-problems');
        } catch (err) {
            setError('Failed to create problem. Please check all fields.');
            console.error(err);
        }
    };

    return (
        <div className="create-problem-container">
            <h1>Create New Problem</h1>
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

                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-btn">Save Problem</button>
            </form>
        </div>
    );
};

export default CreateProblem;
