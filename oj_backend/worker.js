import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import axios from 'axios';
import { mkdtemp, rm } from 'fs/promises';
import path from 'path';
import os from 'os';
import Problem from './models/problem.js';
import SubmissionHistory from './models/history.js';
import TestCase from './models/testcase.js';
import UserProgress from './models/userprogress.js';
import { executeCpp } from './functions/executeCpp.js';
import { executeJava } from './functions/executeJava.js';
import { executePy } from './functions/executePy.js';

mongoose.connect(process.env.MONGODB_URL);

const fetchFileFromURL = async (url) => {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
};

const judge = async (job) => {
    const { submissionId, userId, problemId, code, language, problemName } = job.data;
    const sandboxDir = await mkdtemp(path.join(os.tmpdir(), `judge-${submissionId}-`));
    
    try {
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: 'Judging' });
        const problem = await Problem.findById(problemId);
        if (!problem) throw new Error("Problem not found.");

        const testCases = await TestCase.find({ problemId: problem._id }).lean();
        if (testCases.length === 0) throw new Error("No test cases found for this problem.");
        
        let result;
        if (language === 'cpp') {
            result = await executeCpp(sandboxDir, code, testCases, problem.timeLimit, problem.checker);
        } else if (language === 'java') {
            result = await executeJava(sandboxDir, code, testCases, problem.timeLimit, problem.checker);
        } else if (language === 'python') {
            result = await executePy(sandboxDir, code, testCases, problem.timeLimit, problem.checker);
        }

        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: result.verdict });

        if (result.verdict === 'Accepted') {
            await UserProgress.updateOne({ userId, problemId }, { $set: { status: 'Solved' } }, { upsert: true });
        } else {
            await UserProgress.updateOne({ userId, problemId }, { $setOnInsert: { status: 'Attempted' } }, { upsert: true });
        }
    } catch (err) {
        let errorVerdict = err.message === "Compilation Error" ? "Compilation Error" : "Internal Server Error";
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: errorVerdict });
    } finally {
        await rm(sandboxDir, { recursive: true, force: true }).catch(() => {});
    }
};

const worker = new Worker('submissions', judge, {
    connection: { host: 'redis_queue', port: 6379 },
    concurrency: 2
});

console.log("Judge worker started with concurrency of 2...");