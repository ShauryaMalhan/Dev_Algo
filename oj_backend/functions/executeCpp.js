import { spawn } from 'child_process';
import { writeFile, rm, access, mkdir } from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { runChecker } from '../services/checker.js';
import { createHash } from 'crypto';
import fs from 'fs';

const cachePath = path.join(process.cwd(), '.cache/cpp');
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

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

const execute = (execPath, sandboxDir, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const process = spawn(`"${execPath}"`, [], { shell: true, detached: true, cwd: sandboxDir });
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
            if (code !== 0) reject(new Error(`Runtime Error: ${stderr}`));
            else resolve(stdout);
        });
    });
};

const acquireLock = async (lockPath) => {
    try { await writeFile(lockPath, '', { flag: 'wx' }); return true; } catch (e) { return false; }
};

const waitForLock = async (filePath) => {
    while (true) {
        try { await access(filePath); return; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
};

const compileAndCacheCpp = async (code) => {
    const hash = createHash('sha256').update(code).digest('hex');
    const cachedExecPath = path.join(cachePath, hash);
    const lockPath = `${cachedExecPath}.lock`;

    try {
        await access(cachedExecPath);
        return cachedExecPath;
    } catch {
        if (await acquireLock(lockPath)) {
            const tempSourcePath = path.join(cachePath, `${hash}.cpp`);
            try {
                await writeFile(tempSourcePath, code);
                await compile(tempSourcePath, cachedExecPath);
                return cachedExecPath;
            } finally {
                await rm(tempSourcePath, { force: true });
                await rm(lockPath, { force: true });
            }
        } else {
            await waitForLock(cachedExecPath);
            return cachedExecPath;
        }
    }
};

export const executeCpp = async (sandboxDir, code, testCases, timeLimit, checkerName) => {
    const execPath = await compileAndCacheCpp(code);
    let finalVerdict = 'Accepted';
    for (const [index, tc] of testCases.entries()) {
        try {
            const input = await fetchFileFromURL(tc.inputURL);
            const output = await fetchFileFromURL(tc.outputURL);
            const userOutput = await execute(execPath, sandboxDir, input, timeLimit * 1000);
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