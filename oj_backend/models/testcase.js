import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    inputURL: {
        type: String,
        required: true
    },
    outputURL: {
        type: String,
        required: true
    }
});

const TestCase = mongoose.model('TestCase', TestCaseSchema);
export default TestCase;