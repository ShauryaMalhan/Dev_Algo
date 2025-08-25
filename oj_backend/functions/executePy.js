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

// Helper function for Python execution using spawn
const executePythonWithSpawn = (scriptPath, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const executeProcess = spawn('python3', [scriptPath]);
        
        let stdout = '';
        let stderr = '';
        let timeoutId;

        // Manual timeout to forcefully kill the process
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
            clearTimeout(timeoutId); // Process finished, clear the timeout
            if (code === 0) {
                resolve(stdout);
            } else {
                // For Python, syntax and runtime errors are both caught here
                reject(new Error(`Runtime Error: ${stderr || 'Process exited with a non-zero code.'}`));
            }
        });

        executeProcess.on('error', (err) => {
            clearTimeout(timeoutId);
            reject(new Error(`Execution process error: ${err.message}`));
        });
    });
};

// Main function now adapted for Python
export const executePy = async (code, input, timeLimit = 2) => {
    const jobId = uuid();
    const jobPath = path.join(tempPath, jobId);
    fs.mkdirSync(jobPath, { recursive: true });

    const filepath = path.join(jobPath, 'main.py');
    const inputPath = path.join(jobPath, 'input.txt');

    // 1. Write the code and input to temporary files
    await fs.promises.writeFile(filepath, code);
    await fs.promises.writeFile(inputPath, input);

    try {
        // 2. Execute the Python script
        const output = await executePythonWithSpawn(filepath, inputPath, timeLimit * 1000);
        return output;
    } catch (error) {
        // This catch block will handle TLE and Runtime Errors
        throw error;
    } finally {
        // 3. Clean up the entire temporary directory
        if (fs.existsSync(jobPath)) {
            fs.rmSync(jobPath, { recursive: true, force: true });
        }
    }
};
