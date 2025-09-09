import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import Problem from './models/problem.js';
import SubmissionHistory from './models/history.js';
import TestCase from './models/testcase.js';
import UserProgress from './models/userprogress.js';
import { executeCpp } from './functions/executeCpp.js';
import { executeJava } from './functions/executeJava.js';
import { executePy } from './functions/executePy.js';

if (process.env.MONGODB_URL) {
    mongoose.connect(process.env.MONGODB_URL);
} else {
    console.error("MONGODB_URL environment variable not set.");
    process.exit(1);
}

const judge = async (job) => {
    const { submissionId, userId, problemId, code, language } = job.data;

    try {
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: 'Judging' });

        const problem = await Problem.findById(problemId);
        if (!problem) {
            throw new Error("Problem not found.");
        }

        const testCases = await TestCase.find({ problemId: problem._id }).lean();
        if (testCases.length === 0) {
            throw new Error("No test cases found for this problem.");
        }

        let finalVerdict = 'Accepted';
        for (const [index, tc] of testCases.entries()) {
            let result;
            if (language === 'cpp') {
                result = await executeCpp(code, tc.inputURL, tc.outputURL, problem.timeLimit, problem.memoryLimit, problem.checker);
            } else if (language === 'java') {
                result = await executeJava(code, tc.inputURL, tc.outputURL, problem.timeLimit, problem.memoryLimit, problem.checker);
            } else if (language === 'python') {
                result = await executePy(code, tc.inputURL, tc.outputURL, problem.timeLimit, problem.memoryLimit, problem.checker);
            } else {
                 throw new Error(`Unsupported language: ${language}`);
            }

            if (result.verdict !== 'Accepted') {
                finalVerdict = `${result.verdict} on test case #${index + 1}`;
                break;
            }
        }

        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: finalVerdict });

        if (finalVerdict === 'Accepted') {
            await UserProgress.updateOne({ userId, problemId }, { $set: { status: 'Solved' } }, { upsert: true });
        } else {
            await UserProgress.updateOne({ userId, problemId }, { $setOnInsert: { status: 'Attempted' } }, { upsert: true });
        }
    } catch (err) {
        const errorVerdict = err.message.includes("Compilation Error") ? err.message : "System Error";
        await SubmissionHistory.findByIdAndUpdate(submissionId, { verdict: errorVerdict });
    }
};

const worker = new Worker('submissions', judge, {
    connection: { host: 'redis_queue', port: 6379 },
    concurrency: 1
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

console.log("Judge worker started with concurrency of 1...");