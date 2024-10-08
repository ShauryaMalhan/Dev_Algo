import express, { urlencoded } from 'express';
import DBConnection from "./database/db.js";
import authRoutes from './routes/auth.js';
import cors from 'cors';
import problemRoutes from './routes/problemsList.js'
import authCompiler from './routes/compiler.js';
import History from './routes/history.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

DBConnection();

app.get('/', (req, res) => {
    res.send("Backend is running");
})

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/cppCompiler', authCompiler);
app.use('/api/submissions', History);

app.listen(8000, (req, res) => {
    console.log('listening on port 8000');
});