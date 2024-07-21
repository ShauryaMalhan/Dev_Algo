import express from 'express';
import DBConnection from "./database/db.js";
import authRoutes from './routes/auth.js';

const app = express();
app.use(express.json());

DBConnection();

app.use('/api/auth', authRoutes);

app.listen(8000, (req, res) => {
    console.log('listening on port 8000');
});