import { useState, useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import authContext from "../../contexts/auth/authContext";
import "../stylesheets/submitProblem.css";
import Editor from '@monaco-editor/react';

const sanitizeVerdict = (message) => {
    if (!message) return "Idle";
    if (message.startsWith("Running")) return "Running";
    if (message.startsWith("Accepted")) return "Accepted";
    if (message.startsWith("Wrong Answer")) return "Wrong Answer";
    if (message.startsWith("Time Limit Exceeded")) return "Time Limit Exceeded";
    if (message.startsWith("Compilation Error")) return "Compilation Error";
    if (message.startsWith("Runtime Error")) return "Runtime Error";
    return "Error";
};

const SubmitProblem = () => {
    const { slug } = useParams();
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState("");
    const [verdict, setVerdict] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useContext(authContext);
    
    const editorRef = useRef(null);
    const COMPILE_PATH = import.meta.env.VITE_COMPILE_PATH;
    const NEW_SUBMISSION_PATH = import.meta.env.VITE_NEW_SUBMISSION_PATH;
    const GET_PROBLEM_PATH = import.meta.env.VITE_GET_ALL_PROBLEMS_PATH;

    const cppCode = `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`;
    const pyCode = `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`;
    const javaCode = `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;

    useEffect(() => {
        const fetchProblemData = async () => {
            try {
                const response = await axios.get(`${GET_PROBLEM_PATH}/${slug}`);
                setProblem(response.data);
                if (language === 'cpp') setCode(cppCode);
                else if (language === 'python') setCode(pyCode);
                else if (language === 'java') setCode(javaCode);
            } catch (err) {
                console.error("Failed to fetch problem data", err);
            }
        };
        fetchProblemData();
    }, [slug, language, cppCode, pyCode, javaCode, GET_PROBLEM_PATH]);

    const handleProblemSubmit = async () => {
        if (!problem) return;
        setIsSubmitting(true);
        setVerdict("Running...");

        try {
            const response = await axios.post(`${COMPILE_PATH}/${problem._id}`, {
                language,
                code,
            }, {
                headers: { 'auth-token': localStorage.getItem('authtoken') }
            });

            const finalVerdict = response.data.verdict;
            setVerdict(finalVerdict);

            await axios.post(NEW_SUBMISSION_PATH, {
                user: user.username,
                verdict: sanitizeVerdict(finalVerdict),
                language: language,
                problem: problem.name,
                link: `/problems/${slug}`,
            }, {
                headers: { 'auth-token': localStorage.getItem('authtoken') }
            });

        } catch (err) {
            const errorMessage = err.response?.data?.message || "An Unknown Error Occurred";
            setVerdict(errorMessage);
            console.error("Submission Error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        if (lang === 'cpp') setCode(cppCode);
        else if (lang === 'python') setCode(pyCode);
        else if (lang === 'java') setCode(javaCode);
    };

    const handleEditorChange = (value) => {
        setCode(value);
    };
    
    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        document.fonts.ready.then(() => {
            setTimeout(() => editor.layout(), 50);
        });
    }

    useEffect(() => {
        const handleResize = () => {
            if (editorRef.current) {
                editorRef.current.layout();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="submit-page-container">
            {problem ? (
                <>
                    <h1>Submit Solution for: {problem.name}</h1>
                    <div className="editor-container">
                        <div className="editor-header">
                            <div className="language-selector">
                                <button onClick={() => handleLanguageChange('cpp')} className={language === 'cpp' ? 'active' : ''}>C++</button>
                                <button onClick={() => handleLanguageChange('python')} className={language === 'python' ? 'active' : ''}>Python</button>
                                <button onClick={() => handleLanguageChange('java')} className={language === 'java' ? 'active' : ''}>Java</button>
                            </div>
                        </div>
                        
                        <Editor
                            height="60vh"
                            language={language}
                            theme="vs-dark"
                            value={code}
                            onChange={handleEditorChange}
                            onMount={handleEditorDidMount}
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
                        <div className={`verdict-display verdict-${sanitizeVerdict(verdict).toLowerCase().replace(/\s+/g, '-')}`}>
                            Status: {verdict || "Idle"}
                        </div>
                        <button 
                            className="submit-button" 
                            onClick={handleProblemSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit Code"}
                        </button>
                    </div>
                </>
            ) : (
                <p>Loading problem...</p>
            )}
        </div>
    );
};

export default SubmitProblem;
