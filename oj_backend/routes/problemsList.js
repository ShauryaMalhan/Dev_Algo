import express from 'express';
import Problem from '../models/problems.js';

const router = express.Router();

router.post('/problems', async (req, res) => {
    try {
        const problem = await Problem.findOne({title: req.body.title});
        if(problem) { 
            return res.status(400).json({ error: "Sorry a problem with this title aready exist." });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})