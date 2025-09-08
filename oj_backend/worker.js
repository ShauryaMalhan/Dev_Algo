import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import axios from 'axios';
import Problem from './models/problem.js';
import SubmissionHistory from './models/SubmissionHistory.js';
import TestCase from './models/testcase.js';
import { compileAndCacheCpp, runCompiledCpp } from './functions/executeCpp.js';
import { runChecker } from './services/checker.js';

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("Judge worker connected to MongoDB.");
}).catch(err => {
    console.error("Judge worker MongoDB connection error:", err);
    process.exit(1);
});

const fetchFileFromURL = async (url) => {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
};

const judge = async (job) => {
    const { submissionId, code, language, problemName } = job.data;
    
    try {
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: 'Judging' });
        const problem = await Problem.findOne({ name: problemName });
        if (!problem) throw new Error("Problem not found.");

        const testCases = await TestCase.find({ problemId: problem._id }).lean();
        if (testCases.length === 0) throw new Error("No test cases found for this problem.");
        
        const allTestCases = await Promise.all(testCases.map(async (tc) => ({
            input: await fetchFileFromURL(tc.inputURL),
            output: await fetchFileFromURL(tc.outputURL),
        })));

        let executablePath = await compileAndCacheCpp(code);

        let finalVerdict = 'Accepted';
        for (const [index, testcase] of allTestCases.entries()) {
            try {
                const userOutput = await runCompiledCpp(executablePath, testcase.input, problem.timeLimit);
                const checkResult = await runChecker(problem.checker, testcase.input, userOutput, testcase.output);
                if (checkResult.verdict !== 'Accepted') {
                    finalVerdict = `${checkResult.verdict} on test case #${index + 1}`;
                    break;
                }
            } catch (error) {
                finalVerdict = `${error.message} on test case #${index + 1}`;
                break;
            }
        }
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: finalVerdict });
    } catch (err) {
        let errorVerdict = err.message === "Compilation Error" ? "Compilation Error" : "Internal Server Error";
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: errorVerdict });
    }
};

const worker = new Worker('submissions', judge, {
    connection: {
        host: 'redis_queue',
        port: 6379
    },
    concurrency: 5
});

console.log("Judge worker started...");