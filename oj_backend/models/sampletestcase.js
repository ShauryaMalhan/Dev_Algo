import mongoose from 'mongoose';

const SampleTestCaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    input: {
        type: String,
        required: true,
    },
    output: {
        type: String,
        required: true,
    },
});

const SampleTestCase = mongoose.model('SampleTestCase', SampleTestCaseSchema);
export default SampleTestCase;
