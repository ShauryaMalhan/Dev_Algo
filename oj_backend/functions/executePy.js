import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import { runChecker } from '../services/checker.js';

const execute = (sourcePath, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const command = `python "${sourcePath}"`;
        const process = spawn(command, [], { shell: true, detached: true });
        let stdout = '', stderr = '';
        const timeoutId = setTimeout(() => {
            process.kill('SIGKILL');
            reject(new Error('Time Limit Exceeded'));
        }, timeLimitMs);

        process.stdin.write(input);
        process.stdin.end();
        process.stdout.on('data', (data) => stdout += data);
        process.stderr.on('data', (data) => stderr += data);
        process.on('close', (code) => {
            clearTimeout(timeoutId);
            if (code !== 0) reject(new Error(`Runtime Error: ${stderr}`));
            else resolve(stdout);
        });
    });
};

export const executePy = async (sandboxDir, code, testCases, timeLimit, checkerName) => {
    const sourcePath = path.join(sandboxDir, 'main.py');
    await writeFile(sourcePath, code);

    let finalVerdict = 'Accepted';
    let testCaseCounter = 1;
    for (const testcase of testCases) {
        try {
            const userOutput = await execute(sourcePath, testcase.input, timeLimit * 1000);
            const checkResult = await runChecker(checkerName, testcase.input, userOutput, testcase.output);
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
    return { verdict: finalVerdict };
};