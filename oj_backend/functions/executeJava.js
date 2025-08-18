import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
// --- Use spawn from child_process ---
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, 'outputsjava');

if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

// Your cleanup function remains the same
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

// --- NEW: Helper function for Java compilation ---
const compileJavaWithSpawn = (filepath, outPath) => {
    return new Promise((resolve, reject) => {
        // Use javac and the -d flag to specify the output directory for the .class file
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

// --- NEW: Helper function for Java execution ---
const executeJavaWithSpawn = (outPath, className, inputPath, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        // Use java, set the classpath (-cp) to the output directory, and provide the class name
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
            if (code === 0) {
                resolve(stdout);
            } else {
                reject(new Error(`Runtime Error: ${stderr}`));
            }
        });
    });
};

// --- Main function now adapted for Java ---
export const executeJava = async (filepath, inputPath, timeLimit = 2, memoryLimit = 128) => {
    // For Java, the main class name is the same as the filename without the extension
    const className = path.basename(filepath).split('.')[0];
    const outPath = outputPath; // The directory where the .class file will be created
    const timeLimitMs = timeLimit * 1000;
    
    // The path to the compiled .class file
    const classFilePath = path.join(outPath, `${className}.class`);

    try {
        // Step 1: Compile the .java file
        await compileJavaWithSpawn(filepath, outPath);

        // Step 2: Execute the compiled .class file
        const stdout = await executeJavaWithSpawn(outPath, className, inputPath, timeLimitMs);
        return stdout;

    } catch (error) {
        // Re-throw any errors to be handled by the controller
        throw error;
    } finally {
        // The finally block cleans up the source, input, and compiled class file
        try {
            await cleanupFiles([classFilePath, filepath, inputPath]);
        } catch (cleanupError) {
            console.warn(
                `Warning: Cleanup failed for job ${className}.`,
                cleanupError.message
            );
        }
    }
};