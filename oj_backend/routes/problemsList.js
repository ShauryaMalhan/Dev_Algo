import express from 'express';
import Problem from '../models/problem.js';
import fetchAdmin from '../middleware/fetchadmin.js';
import Admin from '../models/admin.js';
import SampleTestCase from '../models/sampletestcase.js';
import upload from '../middleware/multerconfig.js';
import TestCase from '../models/testcase.js';
import deleteExistingTestCases from '../middleware/multerdel.js';
import UserProgress from '../models/userprogress.js';
import fetchuser from '../middleware/fetchuser.js';

const router = express.Router();

router.post('/newProblem', fetchAdmin, async (req, res) => {
    try {
        const adminID = req.admin.id;

        const admin = await Admin.findById(adminID);
        if (!admin) {
            return res.status(404).json({ message: 'Admin user not found.' });
        }

        const existingProblem = await Problem.findOne({ 
            $or: [{ name: req.body.name }, { slug: req.body.slug }] 
        });
 
        if (existingProblem) {
            return res.status(400).json({ message: 'A problem with this name or slug already exists.' });
        }

        const newProblem = new Problem({
            name: req.body.name,
            slug: req.body.slug,
            owner: admin.username,
            difficulty: req.body.difficulty,
            timeLimit: req.body.timeLimit,
            legend: req.body.legend,
            input: req.body.input,
            output: req.body.output,
            notes: req.body.notes,
            checker: req.body.checker,
        });

        const savedProblem = await newProblem.save();
        res.status(201).json(savedProblem);

    } catch (error) {
        res.status(400).json({ message: 'Error creating problem', error: error.message });
    }
});

router.get('/getProblem', async (req, res) => {
    try {
        const problems = await Problem.find().sort({ name: 1 }).lean();
        
        res.status(200).json(problems);

    } catch (err) {
        console.error("Error fetching problems:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/getProblem/with-status', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const allProblems = await Problem.find({}).lean();
        const userProgress = await UserProgress.find({ userId: userId }).lean();
        const progressMap = new Map();
        for (const progress of userProgress) {
            progressMap.set(progress.problemId.toString(), progress.status);
        }
        const problemsWithStatus = allProblems.map(problem => {
            const status = progressMap.get(problem._id.toString()) || 'Todo';
            return {
                ...problem,
                status: status,
            };
        });
        res.status(200).json(problemsWithStatus);
    } catch (err) {
        console.error("Error fetching problems with status:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/getProblem/:slug', async (req, res) => {
    try {
        const problem = await Problem.findOne({ slug: req.params.slug }).lean();

        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }

        const sampleTestCases = await SampleTestCase.find({ problemId: problem._id }).lean();

        const responseData = {
            ...problem,
            sampleTestCases: sampleTestCases
        };

        res.status(200).json(responseData);

    } catch (err) {
        console.error("Error fetching problem by slug:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/getProblem/admin/:id', fetchAdmin, async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(problem);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put('/getProblem/admin/:id', fetchAdmin, async (req, res) => {
    try {
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(updatedProblem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating problem', error: error.message });
    }
});

router.delete('/getProblem/admin/:id', fetchAdmin, async (req, res) => {
    try {
        const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
        if (!deletedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/getProblem/admin/:problemId/testcases', fetchAdmin, async (req, res) => {
    try {
        const testcases = await SampleTestCase.find({ problemId: req.params.problemId });
        res.status(200).json(testcases);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/getProblem/admin/:problemId/testcases', fetchAdmin, async (req, res) => {
    try {
        const { problemId } = req.params;
        const { testCases } = req.body;

        if (!Array.isArray(testCases)) {
            return res.status(400).json({ message: 'A valid array of test cases is required.' });
        }

        await SampleTestCase.deleteMany({ problemId: problemId });

        const newTestCases = testCases.map(tc => ({
            problemId: problemId,
            input: tc.input,
            output: tc.output,
        }));

        if (newTestCases.length > 0) {
            const savedTestCases = await SampleTestCase.insertMany(newTestCases);
            res.status(201).json(savedTestCases);
        } else {
            res.status(200).json({ message: 'All sample test cases deleted successfully.' });
        }

    } catch (error) {
        res.status(400).json({ message: 'Error updating test cases', error: error.message });
    }
});

router.delete('/getProblem/admin/testcases/:testcaseId', fetchAdmin, async (req, res) => {
    try {
        const deletedTestCase = await SampleTestCase.findByIdAndDelete(req.params.testcaseId);
        if (!deletedTestCase) {
            return res.status(404).json({ message: 'Test case not found' });
        }
        res.status(200).json({ message: 'Test case deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/getProblem/admin/:problemId/judging-testcases', fetchAdmin, async (req, res) => {
    try {
        const testcases = await TestCase.find({ problemId: req.params.problemId });
        res.json(testcases);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/getProblem/admin/:problemId/judging-testcases', fetchAdmin, deleteExistingTestCases, upload.any(), async (req, res) => {
    try {
        const { problemId } = req.params;
        const files = req.files;
        const fileMap = new Map();
        files.forEach(file => {
            const lastDotIndex = file.originalname.lastIndexOf('.');
            const baseName = lastDotIndex === -1 
                ? file.originalname 
                : file.originalname.substring(0, lastDotIndex);
            
            if (!fileMap.has(baseName)) {
                fileMap.set(baseName, {});
            }
            
            if (file.fieldname === 'inputFiles') {
                fileMap.get(baseName).input = file;
            } else if (file.fieldname === 'outputFiles') {
                fileMap.get(baseName).output = file;
            }
        });

        const newTestCases = [];
        for (const [baseName, pair] of fileMap.entries()) {
            if (pair.input && pair.output) {
                newTestCases.push({
                    problemId,
                    inputPath: pair.input.path,
                    outputPath: pair.output.path,
                });
            }
        }

        if (newTestCases.length > 0) {
            await TestCase.insertMany(newTestCases);
        }
        
        res.status(201).json({ message: `${newTestCases.length} test case pairs were saved.` });
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

export default router;