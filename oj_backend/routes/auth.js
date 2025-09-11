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
    body('email', 'Please enter a valid email.').isEmail(),
    body('username', 'Username is required.').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { email, username } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'An account with this email already exists.' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'This username is already taken.' });
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ email, otp });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your PiCode Verification Code',
            text: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
        });

        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error("Error in /send-otp:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/register', [
    body('name', 'Name must be between 2 and 20 characters.').isLength({ min: 2, max: 21 }),
    body('username', 'Username must be between 5 and 10 characters and contain no spaces.').isLength({ min: 5, max: 10 }).not().contains(' '),
    body('email', 'Please enter a valid email.').isEmail(),
    body('password', 'Password must be between 6 and 13 characters and contain no spaces.').isLength({ min: 6, max: 13 }).not().contains(' '),
    body('otp', 'OTP must be a 6-digit number.').isLength({ min: 6, max: 6 }).isNumeric(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, username, email, password, otp } = req.body;
    
    try {
        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        const otpAge = Date.now() - otpRecord.createdAt;
        if (otpAge > 5 * 60 * 1000) {
            return res.status(400).json({ message: 'OTP has expired.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            username,
            email,
            password: secPass,
        });
        
        await Otp.deleteOne({ _id: otpRecord._id });

        const data = {
            user: { id: newUser.id }
        };

        const authtoken = jwt.sign(data, JWT_SECRET);
        
        res.status(201).json({ authtoken, username: newUser.username });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
});

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