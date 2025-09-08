import express from 'express';
import fs from 'fs/promises';
import { compileAndCacheCpp, runCompiledCpp } from '../functions/executeCpp.js';
import { runChecker } from '../services/checker.js';
import Problem from '../models/problem.js';
import TestCase from '../models/testcase.js';
import fetchuser from '../middleware/fetchuser.js';

const router = express.Router();

router.post('/run/:problemId', fetchuser, async (req, res) => {
    const { language, code } = req.body;
    const { problemId } = req.params;
    
    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ verdict: 'Problem not found.' });
        }

        const testCaseFiles = await TestCase.find({ problemId }).lean();
        if (testCaseFiles.length === 0) {
            return res.status(400).json({ verdict: 'No test cases found for this problem.' });
        }
        
        const allTestCases = await Promise.all(testCaseFiles.map(async (tc) => ({
            input: await fs.readFile(tc.inputPath, 'utf-8'),
            output: await fs.readFile(tc.outputPath, 'utf-8'),
        })));
        
        let executablePath;
        if (language === 'cpp') {
            executablePath = await compileAndCacheCpp(code);
        }

        let testCaseCounter = 1;
        for (const testcase of allTestCases) {
            try {
                let userOutput;
                if (language === 'cpp') {
                    userOutput = await runCompiledCpp(executablePath, testcase.input, problem.timeLimit);
                }

                const checkResult = await runChecker(problem.checker, testcase.input, userOutput, testcase.output);
                
                if (checkResult.verdict !== 'Accepted') {
                    const verdictMessage = `${checkResult.verdict} on test case #${testCaseCounter}`;
                    return res.status(200).json({ verdict: verdictMessage });
                }

            } catch (error) {
                return res.status(200).json({ verdict: `${error.message} on test case #${testCaseCounter}` });
            }
            testCaseCounter++;
        }

        res.status(200).json({ verdict: 'Accepted' });

    } catch (err) {
        if (err.message === "Compilation Error") {
            return res.status(200).json({ verdict: "Compilation Error" });
        }
        console.error("Internal Server Error:", err);
        res.status(500).json({ verdict: "Internal Server Error" });
    }
});

export default router;