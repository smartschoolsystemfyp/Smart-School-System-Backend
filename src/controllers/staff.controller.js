import Attendance from "../models/attendance.model.js";
import Staff from "../models/staff.model.js";

class StaffController {
  // Retrieve all staff members
  async getAllStaff(req, res) {
    const { name, role } = req.query;

    const query = {};

    if (role) query.role = { $regex: role, $options: "i" };
    if (name) query.name = { $regex: name, $options: "i" };

    const staff = await Staff.find(query).select("-password");

    const staffIds = staff.map((staff) => staff._id);

    const attendanceRecords = await Attendance.aggregate([
      { $match: { referenceId: { $in: staffIds }, attendanceOf: "Staff" } },
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
      acc[record._id] = record.attendancePercentage.toFixed(2);
      return acc;
    }, {});

    const studentsWithAttendance = staff.map((staff) => ({
      ...staff.toObject(),
      attendancePercentage: attendanceMap[staff._id] || "0.00",
    }));

    return res.status(200).json({
      success: true,
      message: "Staff members retrieved successfully",
      staff: studentsWithAttendance,
    });
  }

  // Retrieve details of a specific staff member by ID
  async getStaffById(req, res) {
    const { id } = req.params;
    const staff = await Staff.findById(id);

    if (!staff) {
      throw new Error("Staff member not found");
    }

    return res.status(200).json({
      success: true,
      message: "Staff member retrieved successfully",
      staff,
    });
  }

  // Update staff details
  async updateStaff(req, res) {
    const { id } = req.params;
    const updatedStaff = await Staff.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedStaff) {
      throw new Error("Staff member not found");
    }

    return res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      updatedStaff,
    });
  }

  // Remove a staff member
  async deleteStaff(req, res) {
    const { id } = req.params;
    const deletedStaff = await Staff.findByIdAndDelete(id);

    if (!deletedStaff) {
      throw new Error("Staff member not found");
    }

    return res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  }
}

export default new StaffController();
