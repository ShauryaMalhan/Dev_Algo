import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempPath = path.join(__dirname, 'temp');

if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
}

const compileCpp = (filepath, outPath) => {
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

const executeProgram = (executablePath, inputPath, timeLimitMs) => {
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
            // --- CORRECTED LOGIC ---
            // A non-zero exit code indicates a runtime error.
            if (code !== 0) {
                reject(new Error(`Runtime Error: ${stderr || 'Process exited with a non-zero code.'}`));
            } else {
                // If the exit code is 0, the program succeeded, even if stdout is empty.
                // We also check stderr here because some valid programs might print warnings.
                // For a strict judge, you might reject if stderr is not empty.
                resolve(stdout);
            }
        });
    });
};

export const executeCpp = async (code, input, timeLimit = 2) => {
    const jobId = uuid();
    const jobPath = path.join(tempPath, jobId);
    fs.mkdirSync(jobPath, { recursive: true });

    const filepath = path.join(jobPath, 'main.cpp');
    const inputPath = path.join(jobPath, 'input.txt');
    const outPath = path.join(jobPath, 'main.out');

    // 1. Write the code and input to temporary files
    await fs.promises.writeFile(filepath, code);
    await fs.promises.writeFile(inputPath, input);

    try {
        // 2. Compile the .cpp file
        await compileCpp(filepath, outPath);
        
        // 3. Execute the compiled .out file
        const output = await executeProgram(outPath, inputPath, timeLimit * 1000);
        return output;
    } catch (error) {
        // Re-throw any errors (Compilation, TLE, Runtime)
        throw error;
    } finally {
        // 4. Clean up the entire temporary directory
        if (fs.existsSync(jobPath)) {
            fs.rmSync(jobPath, { recursive: true, force: true });
        }
    }
};
