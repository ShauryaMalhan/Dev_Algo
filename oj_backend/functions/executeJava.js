import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import { runChecker } from '../services/checker.js';

const compile = (sourcePath, sandboxDir) => {
    return new Promise((resolve, reject) => {
        const command = `javac -d "${sandboxDir}" "${sourcePath}"`;
        const process = spawn(command, [], { shell: true });
        let error = '';
        process.stderr.on('data', (data) => error += data);
        process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Compilation Error: ${error}`)));
    });
};

const execute = (sandboxDir, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const command = `java -cp "${sandboxDir}" Main`;
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

export const executeJava = async (sandboxDir, code, testCases, timeLimit, checkerName) => {
    const sourcePath = path.join(sandboxDir, 'Main.java');
    await writeFile(sourcePath, code);
    await compile(sourcePath, sandboxDir);

    let finalVerdict = 'Accepted';
    let testCaseCounter = 1;
    for (const testcase of testCases) {
        try {
            const userOutput = await execute(sandboxDir, testcase.input, timeLimit * 1000);
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