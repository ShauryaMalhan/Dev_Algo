import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, 'outputsjava');

if (!fs.existsSync(outputPath)) {
    try {
        fs.mkdirSync(outputPath, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}

export const executeJava = async (filepath, inputPath) => {
    const jobId = path.basename(filepath).split('.')[0];
    const outPath = outputPath;

    return new Promise((resolve, reject) => {
        const command = `javac "${filepath}" -d "${outPath}" && java -cp "${outPath}" ${jobId} < "${inputPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
                reject({ error, stderr });
                return; 
            }
            if (stderr) {
                console.log(stderr);
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    });
};
