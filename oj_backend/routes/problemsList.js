import express from 'express';
import Problem from '../models/problems.js';

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
            inputDescription: req.body.inputDescription,
            outputDescription: req.body.outputDescription,
            testcases: req.body.testcases,
            constraints: req.body.constraints,
            createdBy: req.body.createdBy
        })

        console.log(newProblem);
        res.status(200).send(newProblem);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

router.get('/getProblem', async (req, res) => {
    try {
        const problems = await Problem.find();
        res.status(200).send(problems);
    } catch (err) {
        res.status(500).send(err);
    }
})

export default router;