import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import '../stylesheets/problemdetails.css';
import { parsePolygonLatex } from '../services/latexParser';
import { FaCopy } from 'react-icons/fa';

const ProblemDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const GET_PROBLEM_BY_SLUG_PATH = import.meta.env.VITE_GET_ALL_PROBLEMS_PATH; 

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await axios.get(`${GET_PROBLEM_BY_SLUG_PATH}/${slug}`);
                setProblem(response.data);
            } catch (err) {
                setError('Problem not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [slug]);

    const handleNavigateToSubmit = () => {
        navigate(`/problems/${slug}/submit`, { state: problem });
    };

    const handleCopy = (text, id) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };

    if (loading) return <div className="loading-container">Loading problem...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!problem) return null;

    return (
        <div className="problem-detail-container">
            <div className="problem-header">
                <h1>{problem.name}</h1>
                <div className="header-meta">
                    <span>Time Limit: {problem.timeLimit}s</span>
                    <span>Owner: {problem.owner}</span>
                </div>
            </div>

            <div className="problem-body">
                <div className="problem-section">
                    <h2>Legend</h2>
                    {/* 2. Parse the text and render the resulting HTML */}
                    <div className="content-box" dangerouslySetInnerHTML={{ __html: parsePolygonLatex(problem.legend) }} />
                </div>

                <div className="problem-section">
                    <h2>Input Format</h2>
                    <div className="content-box" dangerouslySetInnerHTML={{ __html: parsePolygonLatex(problem.input) }} />
                </div>

                <div className="problem-section">
                    <h2>Output Format</h2>
                    <div className="content-box" dangerouslySetInnerHTML={{ __html: parsePolygonLatex(problem.output) }} />
                </div>
                {/* This section for sample test cases remains the same */}
                {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                    <div className="problem-section">
                        <h2>Sample Cases</h2>
                        {problem.sampleTestCases.map((tc, index) => (
                            <div key={index} className="sample-case-grid">
                                {/* Input Box */}
                                <div className="sample-box">
                                    <div className="sample-box-header">
                                        <h4>Sample Input {index + 1}</h4>
                                        <button 
                                            className="copy-btn" 
                                            onClick={() => handleCopy(tc.input, `input-${index}`)}
                                            title="Copy to clipboard"
                                        >
                                            {copiedId === `input-${index}` ? 'Copied!' : <FaCopy />}
                                        </button>
                                    </div>
                                    <pre className="sample-io">{tc.input}</pre>
                                </div>
                                {/* Output Box */}
                                <div className="sample-box">
                                    <div className="sample-box-header">
                                        <h4>Sample Output {index + 1}</h4>
                                        {/* --- NEW: Copy button for the output --- */}
                                        <button 
                                            className="copy-btn" 
                                            onClick={() => handleCopy(tc.output, `output-${index}`)}
                                            title="Copy to clipboard"
                                        >
                                            {copiedId === `output-${index}` ? 'Copied!' : <FaCopy />}
                                        </button>
                                    </div>
                                    <pre className="sample-io">{tc.output}</pre>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {problem.notes && (
                    <div className="problem-section">
                        <h2>Notes</h2>
                        <div className="content-box" dangerouslySetInnerHTML={{ __html: parsePolygonLatex(problem.notes) }} />
                    </div>
                )}
                
            </div>

            <div className="problem-footer">
                <button className="submit-solution-btn" onClick={handleNavigateToSubmit}>
                    Submit Solution
                </button>
            </div>
        </div>
    );
};

export default ProblemDetail;
