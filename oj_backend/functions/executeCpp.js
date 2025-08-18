import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, 'outputsCpp');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

const cleanupFiles = async (files, retries = 5, delay = 300) => {
    let lastError = null;
    for (let i = 0; i < retries; i++) {
        try {
            files.forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            });
            return; // Success, exit the function
        } catch (error) {
            lastError = error;
            if (error.code === 'EPERM' && i < retries - 1) {
                // If permission error, wait and try again
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                // For other errors or on the last retry, throw
                throw lastError;
            }
        }
    }
};

// --- UPDATED: Function now accepts optional time and memory limits ---
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

// --- NEW: Helper function for execution using spawn ---
const executeWithSpawn = (executablePath, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const executeProcess = spawn(executablePath);
        let stdout = '';
        let stderr = '';
        let timeoutId;

        // Manual timeout to forcefully kill the process
        timeoutId = setTimeout(() => {
            // taskkill is a robust way to terminate a process tree on Windows
            spawn('taskkill', ['/pid', executeProcess.pid, '/f', '/t']);
            reject(new Error(`Time Limit Exceeded`));
        }, timeLimitMs);

        // Manually pipe the input file to the process's standard input
        const inputStream = fs.createReadStream(inputPath);
        inputStream.pipe(executeProcess.stdin);

        executeProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        executeProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        executeProcess.on('close', (code) => {
            clearTimeout(timeoutId); // Process finished, clear the timeout
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(`Runtime Error: ${stderr}`));
            }
        });
    });
};

// --- Main function now uses the new spawn helpers ---
export const executeCpp = async (filepath, inputPath, timeLimit = 2, memoryLimit = 128) => {
    const jobId = path.basename(filepath).split('.')[0];
    const outputFilename = `${jobId}.out`;
    const outPath = path.join(outputPath, outputFilename);
    const timeLimitMs = timeLimit * 1000;

    // The sanitization check is no longer needed because spawn handles arguments safely

    try {
        // --- Step 1: Compile the code using spawn ---
        await compileWithSpawn(filepath, outPath);

        // --- Step 2: Execute the compiled code using spawn ---
        const stdout = await executeWithSpawn(outPath, inputPath, timeLimitMs);
        return stdout;

    } catch (error) {
        // This single catch block handles errors from both helpers
        // We re-throw the error to be handled by the main controller
        throw error;
    } finally {
        // The finally block and cleanup function are unchanged
        try {
            await cleanupFiles([outPath, filepath, inputPath]);
        } catch (cleanupError) {
            console.warn(
                `Warning: Cleanup failed for job ${jobId}.`,
                cleanupError.message
            );
        }
    }
};