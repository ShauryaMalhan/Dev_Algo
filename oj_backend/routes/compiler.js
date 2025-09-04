import express from 'express';
import fs from 'fs/promises';
import { executeCpp } from '../functions/executeCpp.js';
import { executeJava } from '../functions/executeJava.js';
import { executePy } from '../functions/executePy.js';
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
            return res.status(404).json({ message: 'Problem not found.' });
        }
        const allTestCases = await TestCase.find({ problemId }).lean();
        if (allTestCases.length === 0) {
            return res.status(400).json({ message: 'No test cases found for this problem.' });
        }
        let testCaseCounter = 1;
        for (const testcase of allTestCases) {
            const inputContent = await fs.readFile(testcase.inputPath, 'utf-8');
            const expectedOutputContent = await fs.readFile(testcase.outputPath, 'utf-8');
            try {
                let userOutput;
                if (language === 'cpp') {
                    userOutput = await executeCpp(code, inputContent, problem.timeLimit);
                } else if (language === 'java') {
                    userOutput = await executeJava(code, inputContent, problem.timeLimit);
                } else if (language === 'python') {
                    userOutput = await executePy(code, inputContent, problem.timeLimit);
                } 

                if (userOutput.trim() !== expectedOutputContent.trim()) {
                    return res.status(200).json({ verdict: `Wrong Answer on test case #${testCaseCounter}` });
                }
            } catch (error) {
                return res.status(200).json({ verdict: `${error.message} on test case #${testCaseCounter}` });
            }
            testCaseCounter++;
        }
        res.status(200).json({ verdict: 'Accepted' });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
