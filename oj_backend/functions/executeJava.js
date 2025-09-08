import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { createHash } from 'crypto';
import { rm } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cachePath = path.join(__dirname, 'javaCache');
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

const compileWithSpawn = (filepath) => {
    return new Promise((resolve, reject) => {
        const command = `javac "${filepath}"`;
        const compileProcess = spawn(command, [], { shell: true });
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

const executeWithSpawn = (cacheDir, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const command = `java -cp "${cacheDir}" Main`;
        const executeProcess = spawn(command, [], { shell: true });
        let stdout = '';
        let stderr = '';
        let timeoutId;

        timeoutId = setTimeout(() => {
            executeProcess.kill('SIGKILL');
            reject(new Error(`Time Limit Exceeded`));
        }, timeLimitMs);

        executeProcess.stdin.write(input);
        executeProcess.stdin.end();

        executeProcess.stdout.on('data', (data) => { stdout += data.toString(); });
        executeProcess.stderr.on('data', (data) => { stderr += data.toString(); });
        
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

export const compileAndCacheJava = async (code) => {
    const hash = createHash('sha256').update(code).digest('hex');
    const cacheDir = path.join(cachePath, hash);
    const sourcePath = path.join(cacheDir, 'Main.java');

    try {
        await fs.promises.access(cacheDir);
        return cacheDir;
    } catch {
        await fs.promises.mkdir(cacheDir, { recursive: true });
        await fs.promises.writeFile(sourcePath, code);
        try {
            await compileWithSpawn(sourcePath);
            return cacheDir;
        } catch (error) {
            await rm(cacheDir, { recursive: true, force: true }).catch(() => {});
            throw error;
        }
    }
};

export const runCompiledJava = async (cacheDir, input, timeLimit) => {
    const timeLimitMs = timeLimit * 1000;
    try {
        const output = await executeWithSpawn(cacheDir, input, timeLimitMs);
        return output;
    } catch (error) {
        throw error;
    }
};