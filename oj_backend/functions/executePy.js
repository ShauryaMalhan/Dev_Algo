import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to your specific folders for Python
const codesPath = path.join(__dirname, 'codesPy');
const inputsPath = path.join(__dirname, 'inputs');

// Ensure all directories exist
[codesPath, inputsPath].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Helper function to retry file deletion
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

// Helper function for Python execution using spawn
const executePythonWithSpawn = (scriptPath, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const executeProcess = spawn('python3', [scriptPath]);
        
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

// Main function now takes raw code and input
export const executePy = async (code, input, timeLimit = 2) => {
    const jobId = uuid();
    const timeLimitMs = timeLimit * 1000;

    // Define unique file paths for this specific job in your preferred folders
    const codeFilePath = path.join(codesPath, `${jobId}.py`);
    const inputFilePath = path.join(inputsPath, `${jobId}.txt`);

    try {
        // 1. Write the code and input to their respective files
        await fs.promises.writeFile(codeFilePath, code);
        await fs.promises.writeFile(inputFilePath, input);

        // 2. Execute the Python script
        const stdout = await executePythonWithSpawn(codeFilePath, inputFilePath, timeLimitMs);
        return stdout;

    } catch (error) {
        // Re-throw any errors to be handled by the controller
        throw error;
    } finally {
        // 3. Clean up the individual files from their respective directories
        try {
            await cleanupFiles([codeFilePath, inputFilePath]);
        } catch (cleanupError) {
            console.warn(
                `Warning: Cleanup failed for job ${jobId}.`,
                cleanupError.message
            );
        }
    }
};
