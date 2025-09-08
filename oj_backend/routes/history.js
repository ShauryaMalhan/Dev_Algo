import express from 'express';
import SubmissionHistory from '../models/history.js';
import User from '../models/user.js';
import Problem from '../models/problem.js';
import fetchuser from '../middleware/fetchuser.js';
import submissionQueue from '../services/queue.js';

const router = express.Router();

router.post('/newHistory', fetchuser, async (req, res) => {
    try {
        const { problem: problemName, language, code } = req.body;
        const user = await User.findById(req.user.id);
        const problem = await Problem.findOne({ name: problemName });

        if (!problem) {
            return res.status(404).json({ message: "Problem not found." });
        }

        const newSubmission = await SubmissionHistory.create({
            user: user.username,
            problem: problem.name,
            language: language,
            verdict: 'In Queue'
        });

        await submissionQueue.add('new-submission', {
            submissionId: newSubmission._id,
            userId: user._id,
            problemId: problem._id,
            code,
            language,
            problemName: problem.name
        });

        res.status(202).json({ submissionId: newSubmission._id, message: "Submission received and is being judged." });
    } catch (err) {
        console.error("Error creating submission:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/myHistory', fetchuser, async (req, res)=> {
    try {
        const user = await User.findById(req.user.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const submissions = await SubmissionHistory.find({ user: user.username })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const totalSubmissions = await SubmissionHistory.countDocuments({ user: user.username });
        const totalPages = Math.ceil(totalSubmissions / limit);

        res.status(200).json({ submissions, totalPages, currentPage: page });
    } catch(err) {
        console.error("Error fetching user submissions:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/allHistory', async (req, res)=> {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const submissions = await SubmissionHistory.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalSubmissions = await SubmissionHistory.countDocuments();
        const totalPages = Math.ceil(totalSubmissions / limit);

        res.status(200).json({ submissions, totalPages, currentPage: page });
    } catch(err) {
        console.error("Error fetching all submissions:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;