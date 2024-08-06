import Button from "react-bootstrap/Button";
import "../stylesheets/submitProblem.css";
import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const SubmitProblem = () => {
  const location = useLocation();
  const problem = location.state;
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const COMPILE_PATH = import.meta.env.VITE_COMPILE_PATH;

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const formatInput = (input) => {
    return input
      .replace(/[\[\]]/g, "")
      .split(",")
      .map((num) => num.trim())
      .join(" ");
  };

  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    for (const testcase of problem.testcases) {
      const formattedInputs = testcase.inputs
        .map(({ input }) => formatInput(input))
        .join(" ");

      console.log(language);
      console.log(code);
      console.log(formattedInputs);
      const response = await axios.post(COMPILE_PATH, {
        language: language,
        code: code,
        input: formattedInputs,
      });

      console.log(response);
    }
  };

  return (
    <div className="submitSolution mt-3 mb-3">
      <form>
        <div className="codeGroup">
          <label id="language" htmlFor="language" className="codeLabel">
            Select Language
          </label>
          <select id="language" name="language" onChange={handleLanguageChange}>
            <option value="cpp">C++</option>
            <option value="py">Python</option>
            <option value="java">Java</option>
          </select>
          <br />
          <label
            id="code"
            htmlFor="code"
            className="codeLabel"
          >
            Code
          </label>
          <textarea
            placeholder="Enter your code here..."
            id="code"
            name="code"
            className="codeText"
            onChange={handleCodeChange}
          ></textarea>
          <br />
          <br />
          <Button className="mt-3" type="submit" onClick={handleProblemSubmit}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitProblem;
