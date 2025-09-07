import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import Problem from './models/problem.js';
import SubmissionHistory from './models/SubmissionHistory.js';
import TestCase from './models/testcase.js';
import { compileAndCacheCpp, runCompiledCpp } from './functions/executeCpp.js';
import { runChecker } from './services/checker.js';
import fs from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Judge worker connected to MongoDB.");
});

const judge = async (job) => {
    const { submissionId, code, language, problemName } = job.data;
    
    try {
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: 'Judging' });
        const problem = await Problem.findOne({ name: problemName });
        if (!problem) throw new Error("Problem not found.");

        const testCaseFiles = await TestCase.find({ problemId: problem._id }).lean();
        if (testCaseFiles.length === 0) throw new Error("No test cases found.");
        
        const allTestCases = await Promise.all(testCaseFiles.map(async (tc) => ({
            input: await fs.readFile(tc.inputPath, 'utf-8'),
            output: await fs.readFile(tc.outputPath, 'utf-8'),
        })));

        let executablePath;
        if (language === 'cpp') {
            executablePath = await compileAndCacheCpp(code);
        }

        let finalVerdict = 'Accepted';
        let testCaseCounter = 1;
        for (const testcase of allTestCases) {
            try {
                let userOutput;
                if (language === 'cpp') {
                    userOutput = await runCompiledCpp(executablePath, testcase.input, problem.timeLimit);
                }

                const checkResult = await runChecker(problem.checker, testcase.input, userOutput, testcase.output);
                
                if (checkResult.verdict !== 'Accepted') {
                    finalVerdict = `${checkResult.verdict} on test case #${testCaseCounter}`;
                    break;
                }
            } catch (error) {
                finalVerdict = `${error.message} on test case #${testCaseCounter}`;
                break;
            }
            testCaseCounter++;
        }
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: finalVerdict });
    } catch (err) {
        let errorVerdict = "Internal Server Error";
        if (err.message === "Compilation Error") {
            errorVerdict = "Compilation Error";
        }
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: errorVerdict });
        console.error(`Judging failed for job ${job.id}:`, err);
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