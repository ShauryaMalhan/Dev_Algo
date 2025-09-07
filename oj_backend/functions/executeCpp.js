import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codesPath = path.join(__dirname, 'codesCpp');
const inputsPath = path.join(__dirname, 'inputs');
const cachePath = path.join(__dirname, 'codeCache');

[codesPath, inputsPath, cachePath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const cleanupFiles = async (files) => {
    for (const file of files) {
        try {
            await fs.promises.unlink(file);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`Warning: Cleanup failed for ${file}.`, error.message);
            }
        }
    }
};

const compileWithSpawn = (filepath, outPath) => {
    return new Promise((resolve, reject) => {
        const compileProcess = spawn('g++', [filepath, '-o', outPath]);
        let compileError = '';
        compileProcess.stderr.on('data', (data) => {
            compileError += data.toString();
        });
        compileProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Compilation Error: ${compileError}`));
            } else {
                resolve();
            }
        });
    });
};

const executeWithSpawn = (executablePath, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const executeProcess = spawn(executablePath);
        let stdout = '';
        let stderr = '';
        let timeoutId;

        timeoutId = setTimeout(() => {
            spawn('taskkill', ['/pid', executeProcess.pid, '/f', '/t']);
            reject(new Error(`Time Limit Exceeded`));
        }, timeLimitMs);

        const inputStream = fs.createReadStream(inputPath);
        inputStream.pipe(executeProcess.stdin);

        executeProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        executeProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        executeProcess.on('close', (code) => {
            clearTimeout(timeoutId);
            if (code !== 0) {
                reject(new Error(`Runtime Error: ${stderr || 'Process exited with a non-zero code.'}`));
            } else {
                resolve(stdout);
            }
        });
    });
};

export const executeCpp = async (code, input, timeLimit = 2) => {
    const jobId = uuid();
    const timeLimitMs = timeLimit * 1000;
    const hash = createHash('sha256').update(code).digest('hex');
    const cachedExecutablePath = path.join(cachePath, hash);
    const codeFilePath = path.join(codesPath, `${jobId}.cpp`);
    const inputFilePath = path.join(inputsPath, `${jobId}.txt`);

    try {
        await fs.promises.writeFile(inputFilePath, input);

        try {
            await fs.promises.access(cachedExecutablePath);
        } catch {
            await fs.promises.writeFile(codeFilePath, code);
            await compileWithSpawn(codeFilePath, cachedExecutablePath);
        }

        const stdout = await executeWithSpawn(cachedExecutablePath, inputFilePath, timeLimitMs);
        return stdout;

    } catch (error) {
        throw error;
    } finally {
        await cleanupFiles([codeFilePath, inputFilePath]);
    }
};