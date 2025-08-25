import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to your specific folders for Java
const codesPath = path.join(__dirname, 'codesJava');
const inputsPath = path.join(__dirname, 'inputs');
const outputPath = path.join(__dirname, 'outputsJava');

// Ensure all directories exist
[codesPath, inputsPath, outputPath].forEach(dir => {
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

// Helper function for Java compilation using spawn
const compileJavaWithSpawn = (filepath, outPath) => {
    return new Promise((resolve, reject) => {
        const compileProcess = spawn('javac', ['-d', outPath, filepath]);
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

// Helper function for Java execution using spawn
const executeJavaWithSpawn = (outPath, className, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const executeProcess = spawn('java', ['-cp', outPath, className]);
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
export const executeJava = async (code, input, timeLimit = 2) => {
    const jobId = uuid().replace(/-/g, '_');
    const className = `Main_${jobId}`;
    const timeLimitMs = timeLimit * 1000;

    // Define unique file paths for this job
    const codeFilePath = path.join(codesPath, `${className}.java`);
    const inputFilePath = path.join(inputsPath, `${jobId}.txt`);
    const classFilePath = path.join(outputPath, `${className}.class`);

    // Automatically replace the user's class name with our unique one
    const modifiedCode = code.replace(/public\s+class\s+\w+/, `public class ${className}`);

    try {
        // 1. Write the modified code and input to their respective files
        await fs.promises.writeFile(codeFilePath, modifiedCode);
        await fs.promises.writeFile(inputFilePath, input);

        // 2. Compile the .java file
        await compileJavaWithSpawn(codeFilePath, outputPath);

        // 3. Execute the compiled .class file
        const stdout = await executeJavaWithSpawn(outputPath, className, inputFilePath, timeLimitMs);
        return stdout;

    } catch (error) {
        // Re-throw any errors to be handled by the controller
        throw error;
    } finally {
        // 4. Clean up all the generated files
        try {
            await cleanupFiles([classFilePath, codeFilePath, inputFilePath]);
        } catch (cleanupError) {
            console.warn(
                `Warning: Cleanup failed for job ${className}.`,
                cleanupError.message
            );
        }
    }
};
