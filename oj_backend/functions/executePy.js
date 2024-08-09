import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, 'outputsPython');

if (!fs.existsSync(outputPath)) {
    try {
        fs.mkdirSync(outputPath, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}

export const executePy = async (filepath, inputPath) => {
    return new Promise((resolve, reject) => {
        const command = `python "${filepath}" < "${inputPath}"`;

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
