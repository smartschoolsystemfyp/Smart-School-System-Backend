import Attendance from "../models/attendance.model.js";
import Student from "../models/student.model.js";

class StudentController {
  // Add a new student
  async registerStudent(req, res) {
    const { name, dob, email, phoneNumber, address, classId } = req.body;

    if (!name || !dob || !email || !phoneNumber || !classId) {
      throw new Error("All fields are required");
    }

    const student = await Student.create({
      name,
      dob,
      email,
      phoneNumber,
      address,
      class: classId,
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student,
    });
  }

  async getAllStudents(req, res) {
    const { classId, name } = req.query;

    const query = {};
    if (classId) query.class = classId;
    if (name) query.name = { $regex: name, $options: "i" };

    const students = await Student.find(query).populate("class", "className");

    const studentIds = students.map((student) => student._id);

    const attendanceRecords = await Attendance.aggregate([
      { $match: { referenceId: { $in: studentIds }, attendanceOf: "Student" } },
      {
        $group: {
          _id: "$referenceId",
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 1,
          attendancePercentage: {
            $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100],
          },
        },
      },
    ]);

    const attendanceMap = attendanceRecords.reduce((acc, record) => {
      acc[record._id] = record.attendancePercentage.toFixed(2); // Format to 2 decimal places
      return acc;
    }, {});

    const studentsWithAttendance = students.map((student) => ({
      ...student.toObject(),
      attendancePercentage: attendanceMap[student._id] || "0.00",
    }));

    return res.status(200).json({
      success: true,
      message: "Students retrieved successfully",
      students: studentsWithAttendance,
    });
  }

  // Retrieve details of a specific student by ID
  async getStudentById(req, res) {
    const { id } = req.params;
    const student = await Student.findById(id).populate("class", "className");

    if (!student) {
      throw new Error("Student not found");
    }

    return res.status(200).json({
      success: true,
      message: "Student details retrieved successfully",
      student,
    });
  }

  // Update student details
  async updateStudent(req, res) {
    const { id } = req.params;
    console.log(req.body.classId);

    const updatedStudent = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStudent) {
      throw new Error("Student not found");
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      updatedStudent,
    });
  }

  // Remove a student
  async deleteStudent(req, res) {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      throw new Error("Student not found");
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  }
}

export default new StudentController();
