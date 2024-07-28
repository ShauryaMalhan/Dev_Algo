import mongoose from "mongoose";

const InputsSchema = new mongoose.Schema({
  input: {
    type: 'string',
    required: true
  }  
})

const TestcaseSchema = new mongoose.Schema({
  inputs: {
    type: [InputsSchema],
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

const InputDescriptionsSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  }
})

const OutputDescriptionsSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  }
})

const ConstraintSchema = new mongoose.Schema({
  constraint: {
    type: String,
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
    type: [InputDescriptionsSchema],
    required: true,
  },
  outputDescription: {
    type: [OutputDescriptionsSchema],
    required: true,
  },
  testcases: [TestcaseSchema],
  constraints: {
    type: [ConstraintSchema],
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
