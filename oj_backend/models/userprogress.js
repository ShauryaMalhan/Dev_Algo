import mongoose from 'mongoose';

const UserProgressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    status: {
        type: String,
        enum: ['Solved', 'Attempted'],
        required: true,
    },
}, { timestamps: true });

UserProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
export default UserProgress;
