import Button from "react-bootstrap/Button";
import "../stylesheets/submitProblem.css";
import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const SubmitProblem = () => {
    const cppCode = `#include <bits/stdc++.h>
using namespace std;

int main()
{
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    // Your code here
    return 0;
}`;

  const location = useLocation();
  const problem = location.state;
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(cppCode);
  const [vardict, setVardict] = useState("");
  const COMPILE_PATH = import.meta.env.VITE_COMPILE_PATH;

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const formatInput = (input) => {
    return input
      // eslint-disable-next-line no-useless-escape
      .replace(/[\[\]"]/g, "")
      .split(",")
      .map((num) => num.trim())
      .join(" ");
  };

  const handleProblemSubmit = async (e) => {
    setVardict("Running");
    e.preventDefault();
    let Vardict = false;
    for (const testcase of problem.testcases) {
      const formattedInputs = testcase.inputs
        .map(({ input }) => formatInput(input))
        .join(" ");
        
      console.log(Vardict);

      try{
        const response = await axios.post(COMPILE_PATH, {
            language: language,
            code: code,
            input: formattedInputs,
          });
          if (response.status !== 200) {
            setVardict("Error");
            Vardict = true;
            break;
          }
          const userOutput = response.data.output;
          const expectedOutput = formatInput(testcase.output);
    
          const processOutput = (output) => {
            if (Array.isArray(output)) {
              const temp =  JSON.stringify(output).toLowerCase().trim();
              return formatInput(temp);
            } else if (typeof output === "object") {
              return JSON.stringify(output).toLowerCase().trim();
            } else if (typeof output === "string") {
              return output.toLowerCase().trim();
            } else if (typeof output === "number") {
              return output.toString().toLowerCase().trim();
            }
            return ""; 
          };
    
          const processedUserOutput = processOutput(userOutput);
          const processedExpectedOutput = processOutput(expectedOutput);
    
          console.log(processedUserOutput);
          console.log(processedExpectedOutput);
    
          if (processedUserOutput !== processedExpectedOutput) {
            setVardict("Wrong Answer");
            Vardict = true;
            break;
          }
      } catch (e) {
        setVardict("Error");
        Vardict = true;
        break;
      }
      
    }
    if (!Vardict) {
        setVardict("Accepted");
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
          <label id="code" htmlFor="code" className="codeLabel">
            Code
          </label>
          <textarea
            placeholder="Enter your code here..."
            id="code"
            name="code"
            className="codeText"
            onChange={handleCodeChange}
            value={code}
          />
          <Button className="mt-3" type="submit" onClick={handleProblemSubmit}>
            Submit
          </Button>
          <br/>
          <div className="vardict">
            {vardict}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SubmitProblem;
