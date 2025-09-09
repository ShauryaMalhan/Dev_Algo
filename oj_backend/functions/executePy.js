import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { runChecker } from '../services/checker.js';
import { createHash } from 'crypto';
import fs from 'fs';

const cachePath = path.join(process.cwd(), '.cache/python');
if (!fs.existsSync(cachePath)) { fs.mkdirSync(cachePath, { recursive: true }); }

const fetchFileFromURL = async (url) => {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
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

const execute = (sourcePath, input, timeLimitMs, memoryLimitMB) => {
    return new Promise((resolve, reject) => {
        const command = `python "${sourcePath}"`;
        const process = spawn(command, [], { shell: true, detached: true });
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
                if (stderr.includes('MemoryError')) {
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

export const executePy = async (code, testCases, timeLimit, memoryLimit, checkerName) => {
    const hash = createHash('sha256').update(code).digest('hex');
    const sourcePath = path.join(cachePath, `${hash}.py`);
    await writeFile(sourcePath, code);

    let finalVerdict = 'Accepted';
    let testCaseCounter = 1;
    for (const [index, tc] of testCases.entries()) {
        try {
            const input = await fetchFileFromURL(tc.inputURL);
            const output = await fetchFileFromURL(tc.outputURL);
            const userOutput = await execute(sourcePath, input, timeLimit * 1000, memoryLimit);
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