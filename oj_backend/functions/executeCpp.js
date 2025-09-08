import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cachePath = path.join(__dirname, '../.cache/cpp');
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

const compileWithSpawn = (filepath, outPath) => {
    return new Promise((resolve, reject) => {
        const command = `g++ -std=c++17 -O2 "${filepath}" -o "${outPath}"`;
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

const killProcessTree = (pid) => {
    if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', pid, '/f', '/t']);
    } else {
        spawn('kill', ['-9', `-${pid}`]);
    }
};

const executeWithSpawn = (executablePath, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const command = `"${executablePath}"`;
        const executeProcess = spawn(command, [], { shell: true, detached: true });
        let stdout = '';
        let stderr = '';
        let timeoutId;

        timeoutId = setTimeout(() => {
            killProcessTree(executeProcess.pid);
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

export const compileAndCacheCpp = async (code) => {
    const hash = createHash('sha256').update(code).digest('hex');
    const cachedExecutablePath = path.join(cachePath, hash);
    const tempSourcePath = path.join(cachePath, `${hash}.cpp`);

    try {
        await fs.promises.access(cachedExecutablePath);
        return cachedExecutablePath;
    } catch {
        await fs.promises.writeFile(tempSourcePath, code);
        try {
            await compileWithSpawn(tempSourcePath, cachedExecutablePath);
            return cachedExecutablePath;
        } finally {
            await fs.promises.unlink(tempSourcePath).catch(() => {});
        }
    }
};

export const runCompiledCpp = async (executablePath, input, timeLimit) => {
    const timeLimitMs = timeLimit * 1000;
    try {
        const output = await executeWithSpawn(executablePath, input, timeLimitMs);
        return output;
    } catch (error) {
        throw error;
    }
};