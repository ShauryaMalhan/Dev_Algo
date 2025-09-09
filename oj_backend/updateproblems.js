import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/problem.js';

dotenv.config();

const runMigration = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connection successful.');

        console.log('Updating problems that are missing a memoryLimit...');
        const result = await Problem.updateMany(
            { memoryLimit: { $exists: false } },
            { $set: { memoryLimit: 256 } }
        );

        console.log('Migration complete.');
        console.log(`- Documents scanned: ${result.matchedCount}`);
        console.log(`- Documents updated: ${result.modifiedCount}`);

    } catch (error) {
        console.error('An error occurred during the migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

runMigration();