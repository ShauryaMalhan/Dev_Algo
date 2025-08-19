import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    owner: {
        type: String,
        required: true,
    },
    timeLimit: {
        type: Number,
        required: true,
        default: 2,
    },
    legend: {
        type: String,
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
    notes: {
        type: String,
    },
    checker: {
        type: String,
        required: true,
        enum: [
            'No checker', 'fcmp.cpp', 'hcmp.cpp', 'lcmp.cpp', 'ncmp.cpp',
            'nyesno.cpp', 'rcmp4.cpp', 'rcmp6.cpp', 'rcmp9.cpp',
            'wcmp.cpp', 'yesno.cpp',
        ],
        default: 'No checker',
    },
}, { timestamps: true }); 

const Problem = mongoose.model('Problem', ProblemSchema);
export default Problem;