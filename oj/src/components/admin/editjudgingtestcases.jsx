import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../stylesheets/editjudgingtestcases.css';
import { FaUpload, FaFileAlt, FaTrash } from 'react-icons/fa';

const ManageJudgingTestCases = () => {
    const { id: problemId } = useParams();
    const [existingTestCases, setExistingTestCases] = useState([]);
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('');
    
    const GET_ALL_PROBLEMS_PATH = import.meta.env.VITE_ADMIN_GET_ALL_PROBLEMS_PATH;

    const fetchTestCases = useCallback(async () => {
        try {
            const response = await axios.get(`${GET_ALL_PROBLEMS_PATH}/${problemId}/judging-testcases`, {
                headers: { 'auth-token': localStorage.getItem('adminToken') }
            });
            setExistingTestCases(response.data || []);
        } catch (err) {
            console.error("Failed to fetch test cases", err);
        }
    }, [problemId, GET_ALL_PROBLEMS_PATH]);

    useEffect(() => {
        fetchTestCases();
    }, [fetchTestCases]);

    const onDrop = useCallback(acceptedFiles => {
        setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
        setStatus('');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleUpload = async () => {
        if (files.length === 0) {
            setStatus('Please select files to upload.');
            return;
        }
        setIsUploading(true);
        setStatus('Uploading... this will replace all existing test cases.');

        const formData = new FormData();
        files.forEach(file => {
            formData.append('testcaseFiles', file, file.name);
        });

        try {
            const UPLOAD_URL = `${GET_ALL_PROBLEMS_PATH}/${problemId}/judging-testcases`;
            const response = await axios.post(UPLOAD_URL, formData, {
                headers: { 'auth-token': localStorage.getItem('adminToken') }
            });
            setStatus(response.data.message || 'Test cases uploaded successfully!');
            setFiles([]);
            fetchTestCases();
        } catch (err) {
            console.error("Upload failed:", err);
            setStatus(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="manage-judging-container">
            <h1>Manage Judging Test Cases</h1>
            
            <div className="upload-card">
                <h3>Upload New Test Cases</h3>
                <p className="upload-warning">Warning: Uploading new files will delete all existing test cases for this problem.</p>
                <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
                    <input {...getInputProps()} />
                    <FaUpload className="dropzone-icon" />
                    <p>Drag & drop files here, or click to select</p>
                    <em>(e.g., 01, 01.a, 02, 02.a)</em>
                </div>
                {files.length > 0 && (
                    <div className="file-preview-list">
                        <h4>Staged for Upload:</h4>
                        <ul>
                            {files.map((file, index) => (
                                <li key={index}><FaFileAlt /> {file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <button onClick={handleUpload} disabled={isUploading || files.length === 0} className="upload-btn">
                    {isUploading ? 'Uploading...' : `Upload ${files.length} Files`}
                </button>
                {status && <p className="status-message">{status}</p>}
            </div>

            <div className="existing-testcases-card">
                <h3>Currently Saved Test Cases ({existingTestCases.length})</h3>
                {existingTestCases.length > 0 ? (
                    <p>This problem has test data saved on S3.</p>
                ) : (
                    <p>No judging test cases have been uploaded for this problem yet.</p>
                )}
            </div>
        </div>
    );
};

export default ManageJudgingTestCases;