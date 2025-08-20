import express from 'express';
import Problem from '../models/problem.js';
import fetchAdmin from '../middleware/fetchadmin.js';
import Admin from '../models/admin.js';

const router = express.Router();

router.post('/newProblem', fetchAdmin, async (req, res) => {
    try {
        const adminID = req.admin.id;
        console.log("re");

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

router.get('/getProblem/:id', fetchAdmin, async (req, res) => {
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

router.put('/getProblem/:id', fetchAdmin, async (req, res) => {
    try {
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            req.body, // The new data from the form
            { new: true, runValidators: true } // Options: return the updated doc and run schema validation
        );

        if (!updatedProblem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.status(200).json(updatedProblem);
    } catch (error) {
        res.status(400).json({ message: 'Error updating problem', error: error.message });
    }
});

router.delete('/getProblem/:id', fetchAdmin, async (req, res) => {
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

export default router;