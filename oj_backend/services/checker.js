import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, rm, mkdtemp, mkdir, access } from 'fs/promises';
import path from 'path';
import os from 'os';

const execPromise = promisify(exec);
const CACHE_DIR = path.join(process.cwd(), 'checkerCache');

const ensureCacheDirExists = async () => {
    try {
        await access(CACHE_DIR);
    } catch {
        await mkdir(CACHE_DIR);
    }
};

const defaultChecker = (userOutput, expectedOutput) => {
    return userOutput.trim() === expectedOutput.trim() 
        ? { verdict: 'Accepted', message: 'Outputs match exactly.' }
        : { verdict: 'Wrong Answer', message: 'Outputs do not match.' };
};

const runCppChecker = async (checkerName, input, userOutput, expectedOutput) => {
    await ensureCacheDirExists();
    const checkerBaseName = path.basename(checkerName, '.cpp');
    const checkerSrcPath = path.join(process.cwd(), 'checkers', checkerName);
    const checkerExecPath = path.join(CACHE_DIR, checkerBaseName);
    
    try {
        await access(checkerExecPath);
    } catch {
        try {
            await execPromise(`g++ -std=c++17 -O2 -o "${checkerExecPath}" "${checkerSrcPath}" -I "./checkers"`);
        } catch (compileError) {
            console.error("Checker compilation failed:", compileError);
            throw new Error("Checker compilation failed on the server.");
        }
    }

    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'checker-run-'));
    const inputPath = path.join(tempDir, 'input.txt');
    const userOutputPath = path.join(tempDir, 'userOutput.txt');
    const expectedOutputPath = path.join(tempDir, 'expectedOutput.txt');

    try {
        await writeFile(inputPath, input);
        await writeFile(userOutputPath, userOutput);
        await writeFile(expectedOutputPath, expectedOutput);
        
        await execPromise(`"${checkerExecPath}" "${inputPath}" "${userOutputPath}" "${expectedOutputPath}"`);
        
        return { verdict: 'Accepted', message: 'Solution is correct.' };
    } catch (executionError) {
        const stderr = executionError.stderr || 'Checker reported an error.';
        switch (executionError.code) {
            case 1: return { verdict: 'Wrong Answer', message: stderr };
            case 2: return { verdict: 'Presentation Error', message: stderr };
            case 3: return { verdict: 'Wrong Answer', message: `Checker Failure: ${stderr}` };
            default: throw new Error(`An unknown checker error occurred: ${stderr}`);
        }
    } finally {
        await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
};

const runCheckerWrapper = async (checkerName, input, userOutput, expectedOutput) => {
    if (checkerName === 'No checker' || !checkerName.endsWith('.cpp')) {
        return defaultChecker(userOutput, expectedOutput);
    } else {
        return await runCppChecker(checkerName, input, userOutput, expectedOutput);
    }
};

export { runCheckerWrapper as runChecker };