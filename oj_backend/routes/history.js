import express from 'express';
import History from "../models/history.js";
import UserProgress from '../models/userprogress.js';
import User from '../models/user.js';
import Problem from '../models/problem.js';

const router = express.Router();

router.post('/newHistory', async (req, res)=> {
    try{
        const newHistory = await History.create({
            user: req.body.user,
            verdict: req.body.verdict,
            problem: req.body.problem,
            language: req.body.language,
            link: req.body.link
        });
        const user = await User.findOne({ username: req.body.user });
        const problem = await Problem.findOne({ name: req.body.problem });
        if (user && problem) {
            if (req.body.verdict === 'Accepted') {
                await UserProgress.updateOne(
                    { userId: user._id, problemId: problem._id },
                    { $set: { status: 'Solved' } },
                    { upsert: true } 
                );
            } else {
                await UserProgress.updateOne(
                    { userId: user._id, problemId: problem._id },
                    { $setOnInsert: { status: 'Attempted' } },
                    { upsert: true }
                );
            }
        }

        res.status(200).json(newHistory);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get('/myHistory', async (req, res)=> {
    try {
        const user = req.query.user;
        const history = await History.find({ user: user }).sort({ time: -1 });
        res.status(200).send( history );
    } catch(err) {
        res.status(500).send(err);
    }
})

router.get('/allHistory', async (req, res)=> {
    try {
        const history = await History.find().sort({ time: -1 });
        res.status(200).send( history );
    } catch(err) {
        res.status(500).send(err);
    }
})

export default router;