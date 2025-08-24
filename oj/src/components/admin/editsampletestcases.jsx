import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaTrash } from 'react-icons/fa';
import '../stylesheets/editsampletestcases.css';

const ManageTestCases = () => {
    const { id: problemId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [testCases, setTestCases] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const EDIT_SAMPLE_TEST_API = import.meta.env.VITE_ADMIN_GET_ALL_PROBLEMS_PATH;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const problemResponse = await axios.get(`${EDIT_SAMPLE_TEST_API}/${problemId}`, {
                    headers: { 'auth-token': localStorage.getItem('adminToken') }
                });
                setProblem(problemResponse.data);

                const testCasesResponse = await axios.get(`${EDIT_SAMPLE_TEST_API}/${problemId}/testcases`, {
                    headers: { 'auth-token': localStorage.getItem('adminToken') }
                });

                const data = testCasesResponse.data;
                if (Array.isArray(data) && data.length > 0) {
                    setTestCases(data);
                } else {
                    setTestCases([{ input: '', output: '' }]);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError('Failed to load data.');
                setTestCases([{ input: '', output: '' }]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [problemId, EDIT_SAMPLE_TEST_API]);

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...testCases];
        newTestCases[index][field] = value;
        setTestCases(newTestCases);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        const newTestCases = testCases.filter((_, i) => i !== index);
        setTestCases(newTestCases);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(`${EDIT_SAMPLE_TEST_API}/${problemId}/testcases`, { testCases: testCases }, {
                headers: { 'auth-token': localStorage.getItem('adminToken') }
            });
            alert('Test cases saved successfully!');
            navigate('/admin/manage-problems');
        } catch (err) {
            setError('Failed to save test cases.');
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="manage-testcases-container">
            <h1>Manage Test Cases for "{problem ? problem.name : '...'}"</h1>
            <form onSubmit={handleSubmit}>
                {testCases.map((tc, index) => (
                    <div key={tc._id || index} className="testcase-pair">
                        <h3>Test Case #{index + 1}</h3>
                        <div className="testcase-fields">
                            <div className="field-group">
                                <label>Input</label>
                                <textarea
                                    value={tc.input}
                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                    placeholder="Enter input..."
                                    required
                                />
                            </div>
                            <div className="field-group">
                                <label>Output</label>
                                <textarea
                                    value={tc.output}
                                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                    placeholder="Enter expected output..."
                                    required
                                />
                            </div>
                        </div>
                        {testCases.length >= 1 && (
                            <button type="button" className="remove-btn" onClick={() => removeTestCase(index)}>
                                <FaTrash />
                            </button>
                        )}
                    </div>
                ))}

                <div className="actions-bar">
                    <button type="button" className="add-btn" onClick={addTestCase}>
                        <FaPlus /> Add Another Test Case
                    </button>
                    <button type="submit" className="save-btn">Save All Test Cases</button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default ManageTestCases;
