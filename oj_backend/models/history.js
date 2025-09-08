import mongoose from "mongoose";

const SubmissionHistorySchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    problem: {
        type: String,
        required: true
    },
    verdict: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

const SubmissionHistory = mongoose.model('SubmissionHistory', SubmissionHistorySchema);
export default SubmissionHistory;