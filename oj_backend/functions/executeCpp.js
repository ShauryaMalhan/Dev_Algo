import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, 'outputs');

if (!fs.existsSync(outputPath)) {
    try {
        fs.mkdirSync(outputPath, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}

export const executeCpp = async (filepath, inputPath) => {
    const jobId = path.basename(filepath).split('.')[0];
    const outputFilename = `${jobId}.exe`;
    const outPath = path.join(outputPath, outputFilename);

    return new Promise((resolve, reject) => {
        const command = `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && .\\${outputFilename} < "${inputPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
                return; 
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    });
};