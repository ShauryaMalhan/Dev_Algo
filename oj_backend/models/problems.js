import mongoose from 'mongoose';

const TestcaseSchema = new mongoose.Schema({
    inputs: {
        type: [mongoose.Schema.Types.Mixed],
        required: true,
    },
    output: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    }
}) 

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    statement: {
        type: String,
        required: true,
    },
    inputDescription: {
        type: [String],
        required: true,
    },
    testcases: [TestcaseSchema],
    constraint: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    space: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: Date.now,
    }
})

const Problem = mongoose.model('problem', ProblemSchema);

export default Problem;