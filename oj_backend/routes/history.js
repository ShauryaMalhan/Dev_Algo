import express from 'express';
import SubmissionHistory from '../models/SubmissionHistory.js';
import User from '../models/user.js';
import fetchuser from '../middleware/fetchuser.js';
import submissionQueue from '../services/queue.js';

const router = express.Router();

router.post('/newHistory', fetchuser, async (req, res) => {
    try {
        const { problem, language, code } = req.body;
        const user = await User.findById(req.user.id);

        const newSubmission = await SubmissionHistory.create({
            user: user.username,
            problem: problem,
            language: language,
            verdict: 'In Queue'
        });

        await submissionQueue.add('new-submission', {
            submissionId: newSubmission._id,
            code,
            language,
            problemName: problem
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
        const submissions = await SubmissionHistory.find({ user: user.username })
            .sort({ time: -1 });
        res.status(200).json(submissions);
    } catch(err) {
        res.status(500).json(err);
    }
});

router.get('/allHistory', async (req, res)=> {
    try {
        const history = await SubmissionHistory.find().sort({ time: -1 });
        res.status(200).json(history);
    } catch(err) {
        res.status(500).json(err);
    }
});

export default router;