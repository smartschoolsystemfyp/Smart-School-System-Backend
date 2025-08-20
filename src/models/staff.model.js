import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fatherName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: true,
  },
  cnicNumber: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  dateOfJoining: {
    type: Date,
    required: true,
  },
  dateOfSupernation: {
    type: Date,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  bankBranchName: {
    type: String,
    required: true,
  },
  ibanNumber: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Teacher", "Non-Teaching"],
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return this.role === "Teacher";
    },
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
  },
});

const Staff = mongoose.model("Staff", StaffSchema);

export default Staff;
