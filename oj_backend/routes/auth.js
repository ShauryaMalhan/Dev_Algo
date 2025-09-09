import express from 'express';
import User from '../models/user.js';
import Otp from '../models/otp.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetchuser from '../middleware/fetchuser.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.post('/forgot-password', [
    body('email', 'Please enter a valid email').isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'No user exist with this email.' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 3600000; 
        await user.save();
        const resetUrl = `https://picode.polsage.in/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Password Reset Link for PiCode',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process within one hour:\n\n` +
                  `${resetUrl}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ 
            message: 'If a user with that email exists, a reset link has been sent. Please also check your spam/junk folder.' 
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Failed to send reset email.' });
    }
});


router.post('/reset-password/:token', [
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash( req.body.password, salt);

        user.password = secPass;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
});

router.post('/send-otp', [
    body('email', 'Please enter a valid email').isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ email, otp });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code for Picode',
            text: `Your one-time password is: ${otp}\nThis code is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent to your email successfully.' });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
});

router.post('/register', [
    body('name', 'Enter a Valid Name').isLength({min: 5}),
    body('username', 'Enter a Valid Username').isLength({ min: 3 }),
    body('email', 'Enter a Valid Email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({min: 5}),
    body('otp', 'OTP must be a 6-digit number').isLength({ min: 6, max: 6 }),
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, username, email, password, otp } = req.body;
    
    try{

        const otpRecord = await Otp.findOne({ email, otp }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        let user = await User.findOne({ email });

        if(user){
            return res.status(400).json({ error: "Sorry a user with this email aready exist." });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash( password, salt);

        user = await User.create({
            name,
            username,
            email,
            password: secPass,
        });
        
        await Otp.deleteOne({ _id: otpRecord._id });

        const data = {
            user: {
                id: user.id,
            }
        }

        const authtoken = jwt.sign(data, JWT_SECRET);
        
        res.status(201).json({ authtoken: authtoken, username: user.username });
        
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