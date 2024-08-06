import express from 'express';
import { generateFile } from '../functions/generateFile.js';
import { executeCpp } from '../functions/executeCpp.js';
import { generateInputFile } from '../functions/generateInputFile.js';

const router = express.Router();

router.post('/run', async (req, res) => {
    const {language = 'cpp', code, input} = req.body;
    if(!code) {
        return res.status(500).json({ success: false, message: "Empty code body" });
    }
    try {
        console.log(language);
        console.log(code);
        const filePath = await generateFile(code, language);
        const input_filePath = await generateInputFile(input);
        const output = await executeCpp(filePath, input_filePath);
        res.json({ filePath, output, input_filePath });
        console.log(output);
    } catch(err) {
        console.log(err);
        res.status(500).json({ success: false, message: err.message});
    }
})

export default router;