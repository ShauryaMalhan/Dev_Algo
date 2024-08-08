import express from 'express';
import User from '../models/user.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchuser from '../middleware/fetchuser.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', [
    body('name', 'Enter a Valid Name').isLength({min: 5}),
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({min: 5}),
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({ error: "Sorry a user with this email aready exist." });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: secPass
        })

        const data = {
            user: {
                id: user.id,
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({authtoken})
        
    }  catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

router.post('/login', [
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { password, email } = req.body;

    try {
        let user = await User.findOne({ email: email });
        if(!user){
            return res.status(404).json({ error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(404).json({ error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);

        res.json({ authtoken: authtoken, username: user.username});

    }  catch (err) {
        res.status(500).send("Internal Server Error");
    }
})

router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (err) {
        res.status(500).send("Internal Server Error");
        
    }    
})

export default router;