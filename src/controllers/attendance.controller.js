import Attendance from "../models/attendance.model.js";
import Student from "../models/student.model.js";
import nodemailer from "nodemailer";
import { transporter } from "../utils/index.js";

class AttendanceController {
  // Mark student attendance
  async markStudentAttendance(req, res) {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      throw new Error("Attendance records must be a non-empty array");
    }

    const formattedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const student = await Student.findById(record.studentId);

        if (!student) {
          throw new Error(`Student with ID ${record.studentId} not found`);
        }

        const existingAttendance = await Attendance.findOne({
          referenceId: record.studentId,
          date: record.date,
          attendanceOf: "Student",
        });

        if (existingAttendance) {
          throw new Error(`Attendance already marked`);
        }

        if (record.status === "Absent") {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: "Attendance Alert",
            text: `Dear ${student.name},\n\nYou have been marked as absent on ${record.date}.\n\nPlease ensure to attend the classes regularly.\n\nBest regards,\nSchool Management`,
          });
        }

        return {
          attendanceOf: "Student",
          date: record.date,
          status: record.status,
          referenceId: record.studentId,
        };
      })
    );

    const savedRecords = await Attendance.insertMany(formattedRecords);

    return res.status(201).json({
      success: true,
      message: "Student attendance marked successfully",
      savedRecords,
    });
  }

  // Retrieve attendance records for all students
  async getStudentAttendance(req, res) {
    const { classId, date } = req.query;

    const filter = { attendanceOf: "Student" };

    if (classId) {
      filter.referenceId = classId;
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    }

    const attendances = await Attendance.find(filter)
      .populate("referenceId", "name email")
      .sort({ date: -1 });

    return res.status(200).json({
      success: true,
      message: "Student attendance records retrieved successfully",
      attendances,
    });
  }

  // Retrieve attendance details for a specific student
  async getAttendanceByStudentId(req, res) {
    const { studentId } = req.params;

    if (!studentId) {
      throw new Error("Student ID not provided");
    }

    const attendanceRecords = await Attendance.find({
      attendanceOf: "Student",
      referenceId: studentId,
    }).populate("referenceId", "name email");

    return res.status(200).json({
      success: true,
      message: "Attendance details retrieved successfully",
      attendanceRecords,
    });
  }

  // Mark attendance for staff in bulk
  async markStaffAttendance(req, res) {
    const { attendanceRecords } = req.body;

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      throw new Error("Attendance records must be a non-empty array");
    }

    for (const record of attendanceRecords) {
      const existingAttendance = await Attendance.findOne({
        referenceId: record.staffId,
        date: record.date,
        attendanceOf: "Staff",
      });

      if (existingAttendance) {
        throw new Error(`Attendance already marked.`);
      }
    }

    const formattedRecords = attendanceRecords.map((record) => ({
      attendanceOf: "Staff",
      date: record.date,
      status: record.status,
      referenceId: record.staffId,
    }));

    const savedRecords = await Attendance.insertMany(formattedRecords);

    return res.status(201).json({
      success: true,
      message: "Staff attendance marked successfully",
      savedRecords,
    });
  }

  // Retrieve attendance records for all staff members
  async getStaffAttendance(req, res) {
    const { staffType, date } = req.query;

    const filter = { attendanceOf: "Staff" };

    if (staffType) {
      if (!["teaching", "non-teaching"].includes(staffType)) {
        throw new Error("Invalid staffType. Use 'teaching' or 'non-teaching");
      }

      const roleValue = staffType === "teaching" ? "Teacher" : "Non-Teaching";
      filter["referenceId.role"] = roleValue;
    }

    if (date) {
      const selectedDate = new Date(date);
      if (isNaN(selectedDate.getTime())) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: selectedDate,
        $lt: nextDay,
      };
    }

    const attendances = await Attendance.find(filter)
      .populate({
        path: "referenceId",
        select: "name email role",
        match: staffType
          ? {
              role: staffType === "teaching" ? "Teacher" : "Non-Teaching",
            }
          : {},
      })
      .sort({ date: -1 });

    const filteredAttendances = staffType
      ? attendances.filter((att) => att.referenceId !== null)
      : attendances;

    return res.status(200).json({
      success: true,
      message: "Staff attendance records retrieved successfully",
      attendances: filteredAttendances,
      count: filteredAttendances.length,
    });
  }

  // Retrieve attendance details for a specific staff member
  async getAttendanceByStaffId(req, res) {
    const { staffId } = req.params;

    if (!staffId) {
      throw new Error("Staff ID not provided");
    }

    const attendanceRecords = await Attendance.find({
      attendanceOf: "Staff",
      referenceId: staffId,
    });

    return res.status(200).json({
      success: true,
      message: "Staff attendance details retrieved successfully",
      attendanceRecords,
    });
  }
}

export default new AttendanceController();
