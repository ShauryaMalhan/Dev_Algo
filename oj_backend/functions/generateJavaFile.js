import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuid } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dircodes = path.join(__dirname, 'codesJava');

if (!fs.existsSync(dircodes)) {
    try {
        fs.mkdirSync(dircodes, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}

export const generateJavaFile = async (code, language) => {
    const jobId = 'Class_' + uuid().replace(/-/g, '_'); 
    const filename = `${jobId}.java`;
    const filePath = path.join(dircodes, filename);
    
    const javaCode = code.replace(/public class \w+/, `public class ${jobId}`);
    
    fs.writeFileSync(filePath, javaCode);
    return filePath; 
}
