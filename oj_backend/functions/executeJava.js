import { spawn } from 'child_process';
import { writeFile, rm } from 'fs/promises';
import path from 'path';
import { runChecker } from '../services/checker.js';
import { createHash } from 'crypto';
import fs from 'fs';

const cachePath = path.join(process.cwd(), '.cache/java');
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

const compile = (sourcePath, cacheDir) => {
    return new Promise((resolve, reject) => {
        const command = `javac -d "${cacheDir}" "${sourcePath}"`;
        const process = spawn(command, [], { shell: true });
        let error = '';
        process.stderr.on('data', (data) => error += data);
        process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Compilation Error: ${error}`)));
    });
};

const execute = (cacheDir, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const command = `java -cp "${cacheDir}" Main`;
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
    const hash = createHash('sha256').update(code).digest('hex');
    const cacheDir = path.join(cachePath, hash);
    const sourcePath = path.join(cacheDir, 'Main.java');

    try {
        await fs.promises.access(path.join(cacheDir, 'Main.class'));
    } catch {
        await fs.promises.mkdir(cacheDir, { recursive: true });
        await writeFile(sourcePath, code);
        try {
            await compile(sourcePath, cacheDir);
        } catch (error) {
            await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
            throw error;
        }
    }

    let finalVerdict = 'Accepted';
    let testCaseCounter = 1;
    for (const testcase of testCases) {
        try {
            const userOutput = await execute(cacheDir, testcase.input, timeLimit * 1000);
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