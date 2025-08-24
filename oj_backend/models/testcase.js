import mongoose from 'mongoose';

const TestCaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    inputPath: {
        type: String,
        required: true,
    },
    outputPath: {
        type: String,
        required: true,
    },
});

const TestCase = mongoose.model('TestCase', TestCaseSchema);
export default TestCase;