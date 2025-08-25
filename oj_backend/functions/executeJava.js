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

// Helper function for Java compilation
const compileJava = (filepath, jobPath) => {
    return new Promise((resolve, reject) => {
        const compileProcess = spawn('javac', ['-d', jobPath, filepath]);
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

// Helper function for Java execution
const executeJavaProgram = (jobPath, className, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const executeProcess = spawn('java', ['-cp', jobPath, className]);
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
                reject(new Error(`Runtime Error: ${stderr || 'Process exited with a non-zero code.'}`));
            }
        });
    });
};

export const executeJava = async (code, input, timeLimit = 2) => {
    const jobId = uuid().replace(/-/g, '_');
    const className = `Main_${jobId}`;
    const jobPath = path.join(tempPath, jobId);
    fs.mkdirSync(jobPath, { recursive: true });

    const filename = `${className}.java`;
    const filepath = path.join(jobPath, filename);
    const inputPath = path.join(jobPath, 'input.txt');

    // Automatically replace the user's class name with our unique one
    const modifiedCode = code.replace(/public\s+class\s+\w+/, `public class ${className}`);

    // 1. Write the modified code and input to temporary files
    await fs.promises.writeFile(filepath, modifiedCode);
    await fs.promises.writeFile(inputPath, input);

    try {
        // 2. Compile the .java file
        await compileJava(filepath, jobPath);
        
        // 3. Execute the compiled .class file
        const output = await executeJavaProgram(jobPath, className, inputPath, timeLimit * 1000);
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
