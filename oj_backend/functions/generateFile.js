import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dircodes = path.join(__dirname, 'codes');

if(!fs.existsSync(dircodes)) {
    try {
        fs.mkdirSync(dircodes, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}

export const generateFile = async (code, language) => {
    const jobId = uuid();
    const filename = `${jobId}.${language}`;
    const filePath = path.join(dircodes, filename);
    fs.writeFileSync(filePath, code);
    return filePath;
}