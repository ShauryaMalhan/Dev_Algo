import { useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import authContext from "../../contexts/auth/authContext";
import "../stylesheets/submitProblem.css";

// Import the Monaco Editor
import Editor from '@monaco-editor/react';

const sanitizeVerdict = (message) => {
    if (!message) return "Error";
    if (message.startsWith("Accepted")) return "Accepted";
    if (message.startsWith("Wrong Answer")) return "Wrong Answer";
    if (message.startsWith("Time Limit Exceeded")) return "Time Limit Exceeded";
    if (message.startsWith("Compilation Error")) return "Compilation Error";
    if (message.startsWith("Runtime Error")) return "Runtime Error";
    return "Error"; // Default case for other errors
};

const SubmitProblem = () => {
    // Boilerplate code for each language
    const cppCode = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`;
    const pyCode = `def main():\n    # Your code here\n    pass\n\nif __name__ == "__main__":\n    main()`;
    const javaCode = `public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`;

    const location = useLocation();
    const problem = location.state;
    const [language, setLanguage] = useState("cpp");
    const [code, setCode] = useState(cppCode);
    const [verdict, setVerdict] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useContext(authContext);
    const COMPILE_PATH = import.meta.env.VITE_COMPILE_PATH;
    const NEW_SUBMISSION_PATH = import.meta.env.VITE_NEW_SUBMISSION_PATH;

    // Helper function from your original code
    const formatInput = (input) => {
        return (
            input
                .replace(/[\[\]"]/g, "")
                .split(",")
                .map((num) => num.trim())
                .join(" ")
        );
    };
    
    // --- YOUR ORIGINAL API LOGIC IS NOW RESTORED ---
    const handleProblemSubmit = async () => {
        setIsSubmitting(true);
        setVerdict("Running...");

        let finalVerdict = "Accepted";

        for (const testcase of problem.testcases) {
            const formattedInputs = testcase.inputs
                .map(({ input }) => formatInput(input))
                .join("\n");

            try {
                const response = await axios.post(COMPILE_PATH, {
                    language: language,
                    code: code,
                    input: formattedInputs,
                });

                if (response.status !== 200) {
                    finalVerdict = "Error";
                    break; // Stop testing on the first error
                }

                const userOutput = response.data.output.trim();
                const expectedOutput = formatInput(testcase.output).trim();
                console.log(userOutput);
                if (userOutput !== expectedOutput) {
                    finalVerdict = "Wrong Answer";
                    break; // Stop testing on the first wrong answer
                }
            } catch (e) {
                if (e.response && e.response.data && e.response.data.message) {
                    finalVerdict = e.response.data.message;
                } else {
                    finalVerdict = "An Unknown Error Occurred";
                }
                console.error("Submission Error:", e);
                break;
            }
        }

        setVerdict(finalVerdict);

        try {
            await axios.post(NEW_SUBMISSION_PATH, {
                user: user.username,
                verdict: sanitizeVerdict(finalVerdict),
                language: language,
                problem: problem.title,
                link: location.pathname.slice(0, -7),
            });
        } catch (err) {
            console.error("Failed to save submission:", err.message);
        }

        setIsSubmitting(false);
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
        setTimeout(() => {
            editor.layout();
        }, 10);
    }

    return (
        <div className="submit-page-container">
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
                <div className={`verdict-display verdict-${verdict.toLowerCase().replace(/\s+/g, '-')}`}>
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
        </div>
    );
};

export default SubmitProblem;