import { spawn } from 'child_process';

const executeWithSpawn = (code, input, timeLimitMs) => {
    return new Promise((resolve, reject) => {
        const command = `python -c "${code.replace(/"/g, '\\"')}"`;
        const executeProcess = spawn(command, [], { shell: true });
        let stdout = '';
        let stderr = '';
        let timeoutId;

        timeoutId = setTimeout(() => {
            executeProcess.kill('SIGKILL');
            reject(new Error('Time Limit Exceeded'));
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

export const runPython = async (code, input, timeLimit) => {
    const timeLimitMs = timeLimit * 1000;
    try {
        const output = await executeWithSpawn(code, input, timeLimitMs);
        return output;
    } catch (error) {
        throw error;
    }
};