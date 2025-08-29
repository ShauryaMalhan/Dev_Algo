import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaFileUpload, FaFileAlt, FaArrowRight } from 'react-icons/fa';
import '../stylesheets/editjudgingtestcases.css';

const ManageJudgingTestCases = () => {
    const { id: problemId } = useParams();
    const [existingTestCases, setExistingTestCases] = useState([]);
    const [filePairs, setFilePairs] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    
    const GET_ALL_PROBLEMS_PATH = import.meta.env.VITE_ADMIN_GET_ALL_PROBLEMS_PATH;

    const fetchTestCases = async () => {
        try {
            const response = await axios.get(`${GET_ALL_PROBLEMS_PATH}/${problemId}/judging-testcases`, {
                headers: { 'auth-token': localStorage.getItem('adminToken') }
            });
            if (Array.isArray(response.data)) {
                setExistingTestCases(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch test cases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestCases();
    }, []);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        const pairs = [];
        for (let i = 0; i < files.length; i += 2) {
            if (i + 1 < files.length) {
                const inputFile = files[i];
                const outputFile = files[i + 1];

                if (outputFile.name.startsWith(inputFile.name)) {
                    pairs.push({
                        name: inputFile.name,
                        input: inputFile,
                        output: outputFile
                    });
                }
            }
        }
        setFilePairs(pairs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (filePairs.length === 0) {
            setError('No valid input/output pairs selected.');
            return;
        }
        setError('');

        const formData = new FormData();
        filePairs.forEach(pair => {
            formData.append('inputFiles', pair.input, pair.input.name);
            formData.append('outputFiles', pair.output, pair.output.name);
        });

        try {
            await axios.post(`${GET_ALL_PROBLEMS_PATH}/${problemId}/judging-testcases`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth-token': localStorage.getItem('adminToken')
                }
            });
            alert('Test cases uploaded successfully!');
            fetchTestCases();
            setFilePairs([]);
            document.getElementById('fileUploader').value = null;
        } catch (err) {
            setError('File upload failed.');
            console.error(err);
        }
    };

    return (
        <div className="manage-judging-container">
            <h1>Manage Judging Test Cases</h1>
            
            <form onSubmit={handleSubmit} className="upload-form">
                <h2>Upload New Test Case Pairs</h2>
                <div className="file-input-wrapper">
                    <label htmlFor="fileUploader">Select Input & Output Files</label>
                    <input type="file" id="fileUploader" multiple onChange={handleFileSelect} />
                </div>

                {filePairs.length > 0 && (
                    <div className="detected-pairs">
                        <h3>{filePairs.length} Pairs Detected for Upload:</h3>
                        <div className="pair-cards-grid">
                            {filePairs.map(pair => (
                                <div key={pair.name} className="pair-card">
                                    <div className="file-info">
                                        <span>Input</span>
                                        <strong>{pair.input.name}</strong>
                                    </div>
                                    <FaArrowRight className="arrow-icon" />
                                    <div className="file-info">
                                        <span>Output</span>
                                        <strong>{pair.output.name}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit" className="upload-btn" disabled={filePairs.length === 0}>
                    <FaFileUpload /> Upload {filePairs.length} Pairs
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>

            <div className="existing-testcases">
                <h2>Existing Test Cases</h2>
                {loading ? <p>Loading...</p> : (
                    <div className="testcase-list">
                        {existingTestCases.length > 0 ? (
                            existingTestCases.map((tc, index) => (
                                <div key={tc._id} className="testcase-item">
                                    <FaFileAlt />
                                    <span>Test Case #{index + 1}</span>
                                </div>
                            ))
                        ) : (
                            <p>No judging test cases uploaded for this problem yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageJudgingTestCases;
