import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirInputs = path.join(__dirname, 'inputs');

if(!fs.existsSync(dirInputs)) {
    try {
        fs.mkdirSync(dirInputs, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}

export const generateInputFile = async (input) => {
    const jobId = uuid();
    const input_filename = `${jobId}.txt`;
    const input_filePath = path.join(dirInputs, input_filename);
    fs.writeFileSync(input_filePath, input);
    return input_filePath;
}