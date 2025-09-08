import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import axios from 'axios';
import Problem from './models/problem.js';
import SubmissionHistory from './models/history.js';
import TestCase from './models/testcase.js';
import { compileAndCacheCpp, runCompiledCpp } from './functions/executeCpp.js';
import { runChecker } from './services/checker.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("[DEBUG] Judge worker connected to MongoDB.");
}).catch(err => {
    console.error("[DEBUG] Judge worker MongoDB connection error:", err);
    process.exit(1);
});

const fetchFileFromURL = async (url) => {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
};

const judge = async (job) => {
    const { submissionId, code, language, problemName } = job.data;
    console.log(`[DEBUG] Starting judgment for job ${job.id}, submission ID: ${submissionId}`);
    
    try {
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: 'Judging' });
        const problem = await Problem.findOne({ name: problemName });
        if (!problem) throw new Error(`Problem not found: ${problemName}`);

        console.log(`[DEBUG] Found problem: ${problem.name}`);
        const testCases = await TestCase.find({ problemId: problem._id }).lean();
        if (testCases.length === 0) throw new Error("No test cases found for this problem.");
        
        console.log(`[DEBUG] Found ${testCases.length} test cases. Fetching from S3...`);
        const allTestCases = await Promise.all(testCases.map(async (tc) => ({
            input: await fetchFileFromURL(tc.inputURL),
            output: await fetchFileFromURL(tc.outputURL),
        })));
        console.log("[DEBUG] Successfully fetched all test cases.");

        let executablePath;
        if (language === 'cpp') {
            console.log("[DEBUG] Compiling C++ code...");
            executablePath = await compileAndCacheCpp(code);
            console.log("[DEBUG] Compilation successful.");
        }

        let finalVerdict = 'Accepted';
        let testCaseCounter = 1;
        for (const testcase of allTestCases) {
            console.log(`[DEBUG] Running test case #${testCaseCounter}`);
            try {
                let userOutput;
                if (language === 'cpp') {
                    userOutput = await runCompiledCpp(executablePath, testcase.input, problem.timeLimit);
                }

                const checkResult = await runChecker(problem.checker, testcase.input, userOutput, testcase.output);
                
                if (checkResult.verdict !== 'Accepted') {
                    finalVerdict = `${checkResult.verdict} on test case #${testCaseCounter}`;
                    console.log(`[DEBUG] Test case #${testCaseCounter} failed with verdict: ${finalVerdict}`);
                    break;
                }
            } catch (error) {
                console.error(`[DEBUG] CRITICAL ERROR on test case #${testCaseCounter}:`, error);
                finalVerdict = `${error.message || 'Unknown Error'} on test case #${testCaseCounter}`;
                break;
            }
            console.log(`[DEBUG] Test case #${testCaseCounter} passed.`);
            testCaseCounter++;
        }
        console.log(`[DEBUG] Final verdict: ${finalVerdict}`);
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: finalVerdict });
    } catch (err) {
        console.error(`[DEBUG] CRITICAL ERROR in main judge function for job ${job.id}:`, err);
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