import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js'
import fetchadmin from '../middleware/fetchadmin.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
                                
router.post('/register', [
    body('name', 'Enter a Valid Name').isLength({ min: 3 }),
    body('username', 'Enter a Valid Username').isLength({ min: 3 }),
    body('username', 'Enter a Valid Username').isLength({ min: 3 }),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let admin = await Admin.findOne({ username: req.body.username });
        if (admin) {
            return res.status(400).json({ error: "Sorry, an admin with this username already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        admin = await Admin.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: secPass
        });

        const data = {
            admin: {
                id: admin.id
            }
        };
        
        const authtoken = jwt.sign(data, JWT_SECRET);
        
        res.json({ authtoken });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.post('/login', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({min: 5}),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { password, email } = req.body;
    
    try {
        let admin = await Admin.findOne({ email: email });
        if (!admin) {
            return res.status(400).json({ error: "You are not an Admin. Go back!!!" });
        }
        const passwordCompare = await bcrypt.compare(password, admin.password);
        if (!passwordCompare) {
            return res.status(400).json({error: "Please try to login with correct credentials"});
        }
        const data = {
            admin: {
                id: admin.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ authtoken: authtoken, username: admin.username });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
})

router.get('/getadmin', fetchadmin, async (req, res) => {
    try {
        const adminId = req.admin.id;
        const admin = await Admin.findById(adminId).select("-password");
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }    
});

export default router;