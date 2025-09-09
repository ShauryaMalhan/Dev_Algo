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
        const process = spawn(command, { shell: true });
        let error = '';
        process.stderr.on('data', (data) => error += data);
        process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Compilation Error`)));
    });
};

const getMemoryUsage = (pid) => {
    try {
        const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
        const match = status.match(/VmRSS:\s+(\d+)\s+kB/);
        return match ? parseInt(match[1], 10) : 0;
    } catch {
        return 0;
    }
};

const execute = (execPath, input, timeLimitMs, memoryLimitMB) => {
    return new Promise((resolve, reject) => {
        const command = `"${execPath}"`;
        const process = spawn(command, { shell: true, detached: true });
        let stdout = '', stderr = '';

        const memoryLimitKB = memoryLimitMB * 1024;
        const memoryInterval = setInterval(() => {
            if (process.pid) {
                const memUsage = getMemoryUsage(process.pid);
                if (memUsage > memoryLimitKB) {
                    clearInterval(memoryInterval);
                    clearTimeout(timeoutId);
                    process.kill('SIGKILL');
                    reject(new Error('Memory Limit Exceeded'));
                }
            }
        }, 50);

        const timeoutId = setTimeout(() => {
            clearInterval(memoryInterval);
            if (process.pid) process.kill('SIGKILL');
            reject(new Error('Time Limit Exceeded'));
        }, timeLimitMs);

        process.stdin.write(input);
        process.stdin.end();
        process.stdout.on('data', (data) => stdout += data);
        process.stderr.on('data', (data) => stderr += data);
        process.on('close', (code) => {
            clearTimeout(timeoutId);
            clearInterval(memoryInterval);
            if (code !== 0) {
                reject(new Error(`Runtime Error`));
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

export const executeCpp = async (code, inputURL, outputURL, timeLimit, memoryLimit, checkerName) => {
    let execPath;
    try {
        execPath = await compileAndCacheCpp(code);
    } catch (error) {
        return { verdict: error.message };
    }

    try {
        const input = await fetchFileFromURL(inputURL);
        const expectedOutput = await fetchFileFromURL(outputURL);
        const userOutput = await execute(execPath, input, timeLimit * 1000, memoryLimit);
        const checkResult = await runChecker(checkerName, input, userOutput, expectedOutput);
        
        return { verdict: checkResult.verdict };
    } catch (error) {
        return { verdict: error.message };
    }
};