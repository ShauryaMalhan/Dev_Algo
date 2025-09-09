import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import { runChecker } from '../services/checker.js';

const compile = (sourcePath, execPath) => {
    return new Promise((resolve, reject) => {
        const command = `g++ -std=c++17 -O2 "${sourcePath}" -o "${execPath}"`;
        const process = spawn(command, [], { shell: true });
        let error = '';
        process.stderr.on('data', (data) => error += data);
        process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Compilation Error: ${error}`)));
    });
};

const execute = (execPath, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const process = spawn(`"${execPath}"`, [], { shell: true, detached: true });
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

export const executeCpp = async (sandboxDir, code, testCases, timeLimit, checkerName) => {
    const sourcePath = path.join(sandboxDir, 'main.cpp');
    const execPath = path.join(sandboxDir, 'main.out');
    await writeFile(sourcePath, code);
    await compile(sourcePath, execPath);

    let finalVerdict = 'Accepted';
    let testCaseCounter = 1;
    for (const testcase of testCases) {
        try {
            const userOutput = await execute(execPath, testcase.input, timeLimit * 1000);
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