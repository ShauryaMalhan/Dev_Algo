import express from 'express';
import DBConnection from "./database/db.js";
import authRoutes from './routes/auth.js';
import cors from 'cors';
import problemRoutes from './routes/problemsList.js'

const app = express();
app.use(express.json());
app.use(cors());

DBConnection();

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);

app.listen(8000, (req, res) => {
    console.log('listening on port 8000');
});