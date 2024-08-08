import express from 'express';
import History from "../models/history.js";

const router = express.Router();

router.post('/newHistory', async (req, res)=> {
    try{
        const newHistory = await History.create({
            user: req.body.user,
            verdict: req.body.verdict,
            problem: req.body.problem,
            language: req.body.language
        })
        res.status(200).send(newHistory);
    } catch (err) {
        res.status(500).send(err);
    }
})

router.post('/myHistory', async (req, res)=> {
    try {
        const user = req.body.user;
        const history = await History.find({ user: user });
        res.status(200).send( history );
    } catch(err) {
        res.status(500).send(err);
    }
})

router.post('/allHistory', async (req, res)=> {
    try {
        const history = await History.find();
        res.status(200).send( history );
    } catch(err) {
        res.status(500).send(err);
    }
})

export default router;