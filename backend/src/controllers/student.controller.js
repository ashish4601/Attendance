import { isValidObjectId } from "mongoose";
import { Class } from "../models/class.models.js";
import { Session } from "../models/session.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getStudentClasses = asyncHandler(async (req, res) => {
    if (!req.user || !isValidObjectId(req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }
    if (req.user.role !== 'student') {
        throw new ApiError(403, "Forbidden");
    }
    const studentExists = await User.findById(req.user._id);

    if (!studentExists || studentExists.role !== 'student') {
        throw new ApiError(404, "Student not found");
    }

    const classes = await Class.find({ students: req.user._id }).select("name description");
    if (!classes) {
        throw new ApiError(404, "No classes found for the student");
    }
    return res.status(200).json(
        new ApiResponse(200, classes, "Classes retrieved successfully")
    );
});

const getMyAttendance = asyncHandler(async (req, res) => {
    if (!req.user || !isValidObjectId(req.user._id)) {
        throw new ApiError(401, "Unauthorized");
    }
    if (req.user.role !== 'student') {
        throw new ApiError(403, "Forbidden");
    }
    const attendanceRecords = await Attendance.find({ userId: req.user._id })
        .populate("classId", "name")
        .populate("sessionId", "startTime endTime");

    return res.status(200).json(
        new ApiResponse(200, attendanceRecords, "Attendance records retrieved successfully")
    );
});
const getActiveSessionByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }
    if (req.user.role !== 'student') {
        throw new ApiError(403, "Forbidden");
    }
    const classObj = await Class.findOne({
        _id: classId,
        students: req.user._id
    });
    if (!classObj) {
        throw new ApiError(404, "Class not found or student not enrolled");
    }
    const now = new Date();
    const activeSession = await Session.findOne({
        classId: classId,
        startTime: { $lte: now },
        endTime: { $gte: now },
    
    });
    if (!activeSession) {
        throw new ApiError(404, "No active session for this class");
    }
    
    return res.status(200).json(
        new ApiResponse(200, activeSession, "Active session retrieved successfully")
    );
});

export {
    getStudentClasses,
    getActiveSessionByClass,
    getMyAttendance

}