import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: [true, "Roll no must be unique"],
    unique: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  motherName: {
    type: String,
  },
  dob: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Email must be unique"],
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  bFormNumber: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  admissionDate: {
    type: Date,
    // required: true,
  },
  bloodGroup: {
    type: String,
    // required: true,
  },
  religion: {
    type: String,
    required: true,
  },
  cast: {
    type: String,
    // required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  orphan: {
    type: String,
    // required: true,
  },
  result: {
    type: String,
    // enum: ["Pass", "Fail"],
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    required: true,
  },
});

const Student = mongoose.model("Student", StudentSchema);

export default Student;
