import mongoose from "mongoose";

const SubmissionHistorySchema = new mongoose.Schema({
    user: {
        type: 'String',
    },
    time: {
        type: Date,
        default: Date.now,
    },
    verdict: {
        type: 'String',
    },
    problem: {
        type: 'String',
    },
    language: {
        type: 'String',
    }
})

const SubmissionHistory = mongoose.model('SubmissionHistory', SubmissionHistorySchema);

export default SubmissionHistory;