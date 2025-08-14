import dotenv from "dotenv";
dotenv.config();

import Admin from "../models/admin.model.js";
import Staff from "../models/staff.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/index.js";

const generateToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, process.env.JWT_SECRET);
};

class AuthController {
  // Register a new admin
  async registerAdmin(req, res) {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !phoneNumber || !password) {
      throw new Error("All fields are required");
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin,
    });
  }

  // Login Admin
  async loginAdmin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new Error("Admin not found");
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(admin._id, admin.name, "admin");

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  }

  // Logout Admin
  async logoutAdmin(req, res) {
    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  }

  // Register a new staff member (Teacher or Non-Teaching)
  async registerStaff(req, res) {
    const {
      name,
      fatherName,
      dob,
      email,
      phoneNumber,
      cnicNumber,
      address,
      dateOfJoining,
      dateOfSupernation,
      designation,
      bankName,
      bankBranchName,
      ibanNumber,
      accountNumber,
      role,
      password,
    } = req.body;

    if (
      !name ||
      !fatherName ||
      !dob ||
      !email ||
      !phoneNumber ||
      !cnicNumber ||
      !address ||
      !dateOfJoining ||
      !dateOfSupernation ||
      !designation ||
      !bankName ||
      !bankBranchName ||
      !ibanNumber ||
      !accountNumber ||
      !role
    ) {
      throw new Error("All fields are required");
    }

    if (role === "Teacher" && !password)
      throw new Error("Password is required for teacher");

    const existingStaff = await Staff.findOne({ email });

    if (existingStaff) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await Staff.create({
      name,
      fatherName,
      dob,
      email,
      phoneNumber,
      cnicNumber,
      address,
      dateOfJoining,
      dateOfSupernation,
      designation,
      bankName,
      bankBranchName,
      ibanNumber,
      accountNumber,
      role,
      password: hashedPassword,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: staff.email,
      subject: "Password Update",
      text: `Dear ${staff.name},.\n\nYour password for smart school system account is ${password}\n\nBest regards,\nSchool Management`,
    });

    return res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      staff,
    });
  }

  // Login Staff
  async loginStaff(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const teacher = await Staff.findOne({ email });

    if (!teacher || teacher.role !== "Teacher") {
      throw new Error("Teacher not found");
    }

    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = generateToken(teacher._id, teacher.name, teacher.role);

    return res.status(200).json({
      success: true,
      message: "Staff logged in successfully",
      token,
      staff: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
      },
    });
  }

  // Logout Staff
  async logoutStaff(req, res) {
    return res.status(200).json({
      success: true,
      message: "Staff logged out successfully",
    });
  }

  // Update Password for Admin
  async updateAdminPassword(req, res) {
    const id = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new Error("Email, old password, and new password are required");
    }

    if (oldPassword === newPassword) {
      throw new Error(
        "The new password must be different from the old password."
      );
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      throw new Error("Admin not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedNewPassword;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin password updated successfully",
    });
  }

  // Update Password for Staff
  async updateStaffPassword(req, res) {
    const id = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new Error("Email, old password, and new password are required");
    }

    if (oldPassword === newPassword) {
      throw new Error(
        "The new password must be different from the old password."
      );
    }

    const staff = await Staff.findById(id);

    if (!staff) {
      throw new Error("Staff not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, staff.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    staff.password = hashedNewPassword;
    await staff.save();

    return res.status(200).json({
      success: true,
      message: "Staff password updated successfully",
    });
  }

  async forgetPassword(req, res) {
    const { email } = req.body;

    if (!email) throw new Error("Email is required");

    const admin = await Admin.findOne({ email });

    if (!admin) throw new Error("Invalid email address");

    const token = generateToken(admin._id, admin.name, "admin");

    const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${token}&id=${admin._id}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Password Recovery",
      text: `Dear ${admin.name},.\n\nYour password reset link is ${resetURL}\n\nBest regards,\nSchool Management`,
    });

    admin.forgetPasswordToken = token;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  }

  async resetPassword(req, res) {
    const { newPassword, confirmPassword, adminId, forgetPasswordToken } =
      req.body;

    const admin = await Admin.findById(adminId);

    if (!admin) throw new Error("Admin not found");

    if (admin.forgetPasswordToken !== forgetPasswordToken)
      throw new Error("Invalid verify password tokrn");

    if (newPassword !== confirmPassword)
      throw new Error("Passwords don't match");

    if (await bcrypt.compare(newPassword, admin.password))
      throw new Error(
        "The new password cannot be the same as your old password."
      );

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    admin.password = hashedPassword;
    admin.forgetPasswordToken = undefined;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
    });
  }

  // Login Admin
  async updateProfile(req, res) {
    const id = req.user;
    const { name, email } = req.body;

    const admin = await Admin.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated in successfully",
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  }
}

export default new AuthController();
