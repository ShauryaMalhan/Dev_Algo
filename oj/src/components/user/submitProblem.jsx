import Button from "react-bootstrap/Button";
import "../stylesheets/submitProblem.css";
import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import authContext from "../../contexts/auth/authContext";

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
const pycode = `import sys
input = sys.stdin.read
sys.setrecursionlimit(10**6)

def main():
    # Your code here
    pass

if __name__ == "__main__":
    main()`;
const javacode = `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Example to read a line: String input = br.readLine();
        
        // Your code here

    }
}`;

  const location = useLocation();
  const problem = location.state;
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(cppCode);
  const [verdict, setVerdict] = useState("");
  const { user } = useContext(authContext);
  const COMPILE_PATH = import.meta.env.VITE_COMPILE_PATH;
  const NEW_SUBMISSION_PATH = import.meta.env.VITE_NEW_SUBMISSION_PATH;

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    if(e.target.value === 'cpp') {
      setCode(cppCode);
    }
    else if(e.target.value === 'py') {
      setCode(pycode);
    }
    else if(e.target.value === 'java') {
      setCode(javacode);
    }
  };

  const formatInput = (input) => {
    return (
      input
        // eslint-disable-next-line no-useless-escape
        .replace(/[\[\]"]/g, "")
        .split(",")
        .map((num) => num.trim())
        .join(" ")
    );
  };

  const handleProblemSubmit = async (e) => {
    setVerdict("Running");
    e.preventDefault();
    let Verdict = false;
    let saveVerdict = "Accepted";
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
          setVerdict("Error");
          Verdict = true;
          saveVerdict = "Error";
          break;
        }
        const userOutput = response.data.output;
        const expectedOutput = formatInput(testcase.output);

        const processOutput = (output) => {
          if (Array.isArray(output)) {
            const temp = JSON.stringify(output).toLowerCase().trim();
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

        if (processedUserOutput !== processedExpectedOutput) {
          setVerdict("Wrong Answer");
          Verdict = true;
          saveVerdict = "Wrong Answer";
          break;
        }
      } catch (e) {
        setVerdict("Error");
        Verdict = true;
        saveVerdict = "Error";
        break;
      }
      if (!Verdict) {
        saveVerdict = "Accepted";
        setVerdict("Accepted");
      }
    }
    try {
      await axios.post(NEW_SUBMISSION_PATH, {
        user: user.username,
        verdict: saveVerdict,
        language: language,
        problem: problem.title,
        link: location.pathname.slice(0, -7),
      });
    } catch (err) {
      throw new Error(err.message);
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
          <br />
          <div className="vardict">{verdict}</div>
        </div>
      </form>
    </div>
  );
};

export default SubmitProblem;
