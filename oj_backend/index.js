import express, { urlencoded } from 'express';
import DBConnection from "./database/db.js";
import authRoutes from './routes/auth.js';
import cors from 'cors';
import problemRoutes from './routes/problemsList.js'
import authCompiler from './routes/compiler.js';
import History from './routes/history.js';
import Admin from './routes/admin.js';
import User from './routes/user.js';
import Profile from './routes/profile.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

DBConnection();

app.get('/', (req, res) => {
    res.send("Backend is running");
})

app.use('/api/auth', authRoutes); // Auth Routes
app.use('/api/problems', problemRoutes); // Problems Routes
app.use('/api/cppCompiler', authCompiler); // Compiler Routes
app.use('/api/submissions', History); // Submission Routes
app.use('/api/admin', Admin); // Admin Routes
app.use('/api/user', User); // User Routes
app.use('/api/profile', Profile); // Profile Routes


app.listen(8000, (req, res) => {
    console.log('listening on port 8000');
});