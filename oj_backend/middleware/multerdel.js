import path from 'path';
import fs from 'fs';
import TestCase from '../models/testcase.js';

export const deleteExistingTestCases = async (req, res, next) => {
    try {
        const { problemId } = req.params;
        const oldTestCases = await TestCase.find({ problemId });
        for (const tc of oldTestCases) {
            try {
                if (tc.inputPath && fs.existsSync(tc.inputPath)) {
                    fs.unlinkSync(tc.inputPath);
                }
                if (tc.outputPath && fs.existsSync(tc.outputPath)) {
                    fs.unlinkSync(tc.outputPath);
                }
            } catch (err) {
                console.warn(`Could not delete old test case file: ${err.message}`);
            }
        }
        await TestCase.deleteMany({ problemId });
        next();
    } catch (err) {
        res.status(500).json({ message: 'Error during test case cleanup', error: err.message });
    }
};

export default deleteExistingTestCases;