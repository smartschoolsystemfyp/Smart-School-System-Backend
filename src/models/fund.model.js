import mongoose from "mongoose";

const fundSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  detail: {
    type: String,
    required: true,
    trim: true,
  },
});

const Fund = mongoose.model("Fund", fundSchema);

export default Fund;
