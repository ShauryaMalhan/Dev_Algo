import { spawn } from 'child_process';
import { writeFile, rm, access, mkdir } from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { runChecker } from '../services/checker.js';
import { createHash } from 'crypto';
import fs from 'fs';

const cachePath = path.join(process.cwd(), '.cache/java');
if (!fs.existsSync(cachePath)) { fs.mkdirSync(cachePath, { recursive: true }); }

const fetchFileFromURL = async (url) => {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
};

const compile = (sourcePath, cacheDir) => {
    return new Promise((resolve, reject) => {
        const command = `javac -d "${cacheDir}" "${sourcePath}"`;
        const process = spawn(command, [], { shell: true });
        let error = '';
        process.stderr.on('data', (data) => error += data);
        process.on('close', (code) => code === 0 ? resolve() : reject(new Error(`Compilation Error: ${error}`)));
    });
};

const execute = (cacheDir, input, timeLimitMs, memoryLimitMB) => {
    return new Promise((resolve, reject) => {
        const memoryLimitKB = memoryLimitMB * 1024;
        const command = `(ulimit -v ${memoryLimitKB}; java -cp "${cacheDir}" Main)`;
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
            if (code !== 0) reject(new Error(`Runtime Error: ${stderr}`));
            else resolve(stdout);
        });
    });
};

const compileAndCacheJava = async (code) => {
    const hash = createHash('sha256').update(code).digest('hex');
    const cacheDir = path.join(cachePath, hash);
    try {
        await access(path.join(cacheDir, 'Main.class'));
        return cacheDir;
    } catch {
        await mkdir(cacheDir, { recursive: true });
        const sourcePath = path.join(cacheDir, 'Main.java');
        await writeFile(sourcePath, code);
        try {
            await compile(sourcePath, cacheDir);
            return cacheDir;
        } catch(error) {
            await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
            throw error;
        }
    }
};

export const executeJava = async (code, testCases, timeLimit, memoryLimit, checkerName) => {
    const cacheDir = await compileAndCacheJava(code);
    let finalVerdict = 'Accepted';
    for (const [index, tc] of testCases.entries()) {
        try {
            const input = await fetchFileFromURL(tc.inputURL);
            const output = await fetchFileFromURL(tc.outputURL);
            const userOutput = await execute(cacheDir, input, timeLimit * 1000, memoryLimit);
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