import express from 'express';
import Problem from '../models/problem.js';
import SubmissionHistory from '../models/history.js';

const router = express.Router();

router.post('/newProblem', async (req, res) => {
    try {
        const problem = await Problem.findOne({title: req.body.title});
        if(problem) { 
            return res.status(400).json({ error: "Sorry a problem with this title aready exist." });
        }
        const newProblem = await Problem.create({
            title: req.body.title,
            statement: req.body.statement,
            difficulty: req.body.difficulty,
            inputDescription: req.body.inputDescription,
            outputDescription: req.body.outputDescription,
            testcases: req.body.testcases,
            constraints: req.body.constraints,
            createdBy: req.body.createdBy
        })

        res.status(200).send(newProblem);
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
})

router.get('/getProblem', async (req, res) => {
    try {
        const username = req.query.username;
        if (!username) {
            return res.status(400).json({ message: "Username has not loged in." });
        }
        const problems = await Problem.find().lean();
        const userSubmissions = await SubmissionHistory.find({ user: username }).lean();
        const submissionStatusMap = new Map();
        for (const sub of userSubmissions) {
            const problemTitle = sub.problem;
            if (submissionStatusMap.get(problemTitle) !== 'Solved') {
                const newStatus = sub.verdict === 'Accepted' ? 'Solved' : 'Attempted';
                submissionStatusMap.set(problemTitle, newStatus);
            }
        }
        const problemsWithStatus = problems.map(problems => {
            const status = submissionStatusMap.get(problems.title) || 'Todo';
            return {
                ...problems,
                status: status,
            };
        });
        res.status(200).send(problemsWithStatus);
    } catch (err) {
        res.status(500).send(err);
    }
})

export default router;