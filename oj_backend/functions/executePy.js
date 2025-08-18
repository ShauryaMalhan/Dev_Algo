import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
// --- Use spawn from child_process ---
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Note: This outputPath is not strictly needed for Python as there's no compiled output,
// but we keep the structure consistent.
const outputPath = path.join(__dirname, 'outputsPython');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// This cleanup function is copied directly from your C++ file
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

// --- NEW: Helper function for Python execution using spawn ---
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

            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(`Runtime Error: ${stderr}`));
            }
        });
    });
};


// --- Main function now adapted for Python ---
export const executePy = async (filepath, inputPath, timeLimit = 2) => {
    const jobId = path.basename(filepath).split('.')[0];
    const timeLimitMs = timeLimit * 1000;

    try {
        // --- Step 1: Execute the Python script using spawn ---
        const stdout = await executePythonWithSpawn(filepath, inputPath, timeLimitMs);
        return stdout;

    } catch (error) {
        // This catch block will handle TLE and Runtime Errors
        throw error;
    } finally {
        // The finally block cleans up the source and input files
        try {
            await cleanupFiles([filepath, inputPath]);
        } catch (cleanupError) {
            console.warn(
                `Warning: Cleanup failed for job ${jobId}.`,
                cleanupError.message
            );
        }
    }
};