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

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

DBConnection();

app.get('/', (req, res) => {
    res.send("Backend is running");
});

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/cppCompiler', authCompiler);
app.use('/api/submissions', History);
app.use('/api/admin', Admin);
app.use('/api/user', User);
app.use('/api/profile', Profile);

app.listen(8000, (req, res) => {
    console.log('listening on port 8000');
});