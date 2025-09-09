import { spawn } from 'child_process';
import { writeFile, rm, access } from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { runChecker } from '../services/checker.js';
import { createHash } from 'crypto';
import fs from 'fs';

const cachePath = path.join(process.cwd(), '.cache/cpp');
if (!fs.existsSync(cachePath)) { fs.mkdirSync(cachePath, { recursive: true }); }

const fetchFileFromURL = async (url) => {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
};

const compile = (sourcePath, execPath) => {
    return new Promise((resolve, reject) => {
        const command = `g++ -std=c++17 -O2 "${sourcePath}" -o "${execPath}"`;
        const process = spawn(command, [], { shell: true });
        let error = '';
        process.stderr.on('data', (data) => error += data);
        process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Compilation Error: ${error}`)));
    });
};

const execute = (execPath, input, timeLimitMs, memoryLimitMB) => {
    return new Promise((resolve, reject) => {
        const memoryLimitKB = memoryLimitMB * 1024;
        const command = `(ulimit -v ${memoryLimitKB}; "${execPath}")`;
        const process = spawn(command, [], { shell: true, detached: true });
        let stdout = '', stderr = '';
        const timeoutId = setTimeout(() => {
            if (process.pid) process.kill('SIGKILL');
            reject(new Error('Time Limit Exceeded'));
        }, timeLimitMs);
        process.stdin.write(input);
        process.stdin.end();
        process.stdout.on('data', (data) => stdout += data);
        process.stderr.on('data', (data) => stderr += data);
        process.on('close', (code) => {
            clearTimeout(timeoutId);
            if (code !== 0) {
                if (stderr.includes('Killed') || (code === 137 || code === 9)) {
                    reject(new Error('Memory Limit Exceeded'));
                } else {
                    reject(new Error(`Runtime Error: ${stderr}`));
                }
            } else {
                resolve(stdout);
            }
        });
    });
};

const compileAndCacheCpp = async (code) => {
    const hash = createHash('sha256').update(code).digest('hex');
    const cachedExecPath = path.join(cachePath, hash);
    try {
        await access(cachedExecPath);
        return cachedExecPath;
    } catch {
        const sourcePath = path.join(cachePath, `${hash}.cpp`);
        await writeFile(sourcePath, code);
        try {
            await compile(sourcePath, cachedExecPath);
            return cachedExecPath;
        } finally {
            await rm(sourcePath, { force: true }).catch(() => {});
        }
    }
};

export const executeCpp = async (code, testCases, timeLimit, memoryLimit, checkerName) => {
    const execPath = await compileAndCacheCpp(code);
    let finalVerdict = 'Accepted';
    for (const [index, tc] of testCases.entries()) {
        try {
            const input = await fetchFileFromURL(tc.inputURL);
            const output = await fetchFileFromURL(tc.outputURL);
            const userOutput = await execute(execPath, input, timeLimit * 1000, memoryLimit);
            const checkResult = await runChecker(checkerName, input, userOutput, output);
            if (checkResult.verdict !== 'Accepted') {
                finalVerdict = `${checkResult.verdict} on test case #${index + 1}`;
                break;
            }
        } catch (error) {
            finalVerdict = `${error.message} on test case #${index + 1}`;
            break;
        }
    }
    return { verdict: finalVerdict };
};