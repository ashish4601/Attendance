import { isValidObjectId } from "mongoose";
import Class from "../models/Class.model.js";
import Session from "../models/Session.model.js";
import User from "../models/User.model.js";
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

const getActiveSessionByClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const studentId = req.user._id;
    
    if (!isValidObjectId(classId) || !isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid classId or studentId");
    }
    if (!req.user || req.user.role !== 'student') {
        throw new ApiError(403, "Forbidden");
    }
    
    const classData = await Class.findById(classId);
    if (!classData) {
        throw new ApiError(404, "Class not found");
    }
    if (!classData.students.includes(studentId)) {
        throw new ApiError(403, "Student not enrolled in this class");
    }
    const activeSession = await Session.findOne({
        classId,
        isActive: true
    });
    if (!activeSession) {
        throw new ApiError(404, "No active session found for this class");
    }
    return res.status(200).json(
        new ApiResponse(200, activeSession, "Active session retrieved successfully")
    );
});

//TODO: get attendance status


