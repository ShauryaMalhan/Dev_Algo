import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import authContext from '../../contexts/auth/authContext';
import '../stylesheets/submitProblem.css';

const SubmitProblem = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(authContext);
    
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('cpp');
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const GET_PROBLEM_PATH = import.meta.env.VITE_GET_ALL_PROBLEMS_PATH;
    const NEW_SUBMISSION_PATH = import.meta.env.VITE_NEW_SUBMISSION_PATH;

    const cppCode = `#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}`;
    const pyCode = `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`;
    const javaCode = `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;

    useEffect(() => {
        const fetchProblemData = async () => {
            try {
                const response = await axios.get(`${GET_PROBLEM_PATH}/${slug}`);
                setProblem(response.data);
            } catch (err) {
                console.error("Failed to fetch problem data", err);
            }
        };
        fetchProblemData();
    }, [slug, GET_PROBLEM_PATH]);

    useEffect(() => {
        if (language === 'cpp') setCode(cppCode);
        else if (language === 'python') setCode(pyCode);
        else if (language === 'java') setCode(javaCode);
    }, [language, cppCode, pyCode, javaCode]);

    const handleProblemSubmit = async () => {
        if (!code.trim()) {
            setStatus('Submission cannot be empty.');
            return;
        }
        setIsSubmitting(true);
        setStatus('Submitting...');

        try {
            await axios.post(NEW_SUBMISSION_PATH, {
                problem: problem.name,
                language,
                code
            }, {
                headers: { 'auth-token': localStorage.getItem('authtoken') }
            });
            navigate('/mySubmissions');
        } catch (err) {
            console.error("Submission Error:", err);
            setStatus('An error occurred during submission.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="submit-page-container">
            <header className="submit-header">
                <h1>Submit Solution</h1>
                <p>
                    Problem: <Link to={`/problems/${slug}`} className="problem-link">{problem?.name || slug}</Link>
                </p>
            </header>
            
            <main className="editor-container">
                <div className="editor-controls">
                    <div className="language-selector">
                        <label htmlFor="language">Language:</label>
                        <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="cpp">C++</option>
                            <option value="java">Java</option>
                            <option value="python">Python</option>
                        </select>
                    </div>
                </div>
                <div className="editor-wrapper">
                    <Editor
                        height="60vh"
                        language={language}
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>
                <div className="submission-footer">
                    {status && <div className="submission-status">{status}</div>}
                    <button onClick={handleProblemSubmit} disabled={isSubmitting} className="submit-btn">
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default SubmitProblem;