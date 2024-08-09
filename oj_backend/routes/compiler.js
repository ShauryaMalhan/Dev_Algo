import express from 'express';
import { generateFile } from '../functions/generateFile.js';
import { executeCpp } from '../functions/executeCpp.js';
import { generateInputFile } from '../functions/generateInputFile.js';
import { generateJavaFile } from '../functions/generateJavaFile.js';
import { generatePyFile } from '../functions/generatePyFile.js';
import { executeJava } from '../functions/executeJava.js';
import { executePy } from '../functions/executePy.js';


const router = express.Router();

router.post('/run', async (req, res) => {
    const { language = 'cpp', code, input } = req.body;

    if (!code) {
        return res.status(500).json({ success: false, message: "Empty code body" });
    }

    try {
        let filePath, output, input_filePath;

        if (language === 'cpp') {
            filePath = await generateFile(code, language);
            input_filePath = await generateInputFile(input);
            output = await executeCpp(filePath, input_filePath);
        } else if (language === 'java') {
            filePath = await generateJavaFile(code, language);
            input_filePath = await generateInputFile(input);
            output = await executeJava(filePath, input_filePath);
        } else if (language === 'py') {
            filePath = await generatePyFile(code, language);
            input_filePath = await generateInputFile(input);
            output = await executePy(filePath, input_filePath);
        } else {
            return res.status(400).json({ success: false, message: "Unsupported language" });
        }

        res.json({ filePath, output, input_filePath });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;