import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codesPath = path.join(__dirname, 'codesCpp');
const inputsPath = path.join(__dirname, 'inputs');
const outputPath = path.join(__dirname, 'outputsCpp');

[codesPath, inputsPath, outputPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const cleanupFiles = async (files, retries = 5, delay = 300) => {
    let lastError = null;
    for (let i = 0; i < retries; i++) {
        try {
            files.forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            });
            return; // Success
        } catch (error) {
            lastError = error;
            if (error.code === 'EPERM' && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw lastError;
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

    const codeFilePath = path.join(codesPath, `${jobId}.cpp`);
    const inputFilePath = path.join(inputsPath, `${jobId}.txt`);
    const outputFilePath = path.join(outputPath, `${jobId}.out`);

    try {
        await fs.promises.writeFile(codeFilePath, code);
        await fs.promises.writeFile(inputFilePath, input);

        await compileWithSpawn(codeFilePath, outputFilePath);

        const stdout = await executeWithSpawn(outputFilePath, inputFilePath, timeLimitMs);
        return stdout;

    } catch (error) {
        throw error;
    } finally {
        try {
            await cleanupFiles([codeFilePath, inputFilePath, outputFilePath]);
        } catch (cleanupError) {
            console.warn(
                `Warning: Cleanup failed for job ${jobId}.`,
                cleanupError.message
            );
        }
    }
};
