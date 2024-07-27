import mongoose from "mongoose";

const TestcaseSchema = new mongoose.Schema({
  inputs: {
    type: [String], // Array of strings to store multiple inputs
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: false,
  },
});

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
  constraints: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Problem = mongoose.model("problem", ProblemSchema);

export default Problem;
