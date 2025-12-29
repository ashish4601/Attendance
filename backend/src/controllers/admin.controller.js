import { isValidObjectId } from "mongoose";
import Class from "../models/Class.model.js";
import Session from "../models/Session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createClass = asyncHandler(async (req, res) => {
    const { name, description, geofence } = req.body;

    if (!name || !geofence?.lat || !geofence?.lng || !geofence?.radius) {
        throw new ApiError(400, "Name and geofence (lat, lng, radius) are required");
    }

    if (!req.user || !isValidObjectId(req.user._id) || req.user.role !== 'admin') {
        throw new ApiError(401, "Unauthorized");
    }


    if (
        typeof geofence.lat !== "number" ||
        typeof geofence.lng !== "number" ||
        typeof geofence.radius !== "number"
    ) {
        throw new ApiError(400, "Geofence values must be numbers");
    }

    if (
        geofence.lat < -90 || geofence.lat > 90 ||
        geofence.lng < -180 || geofence.lng > 180 ||
        geofence.radius <= 0
    ) {
        throw new ApiError(400, "Invalid geofence values");
    }

    const newClass = new Class({
        name,
        description,
        createdBy: req.user._id,
        geofence
    });

    await newClass.save().catch(err => {
        if (err.code === 11000) {
            throw new ApiError(409, "Class already exists");
        }
        throw err;
    });

    return res.status(201).json(
        new ApiResponse(201, newClass, "Class created successfully")
    );
});


const addStudentToClass = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { studentId } = req.body;

    if (!isValidObjectId(classId) || !isValidObjectId(studentId) || req.user.role !== 'admin') {
        throw new ApiError(400, "Invalid classId or studentId");
    }

    const classObj = await Class.findById(classId);
    if (!classObj) {
        throw new ApiError(404, "Class not found");
    }

    if (classObj.students.includes(studentId)) {
        throw new ApiError(409, "Student already in class");
    }

    classObj.students.push(studentId);
    await classObj.save();

    return res.status(200).json(
        new ApiResponse(200, classObj, "Student added to class successfully")
    );
});


const startSession = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { startTime, endTime } = req.body;

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Forbidden");
    }

    if (!startTime || !endTime || new Date(endTime) <= new Date(startTime)) {
        throw new ApiError(400, "Invalid session time window");
    }

    const classObj = await Class.findById(classId);
    if (!classObj) {
        throw new ApiError(404, "Class not found");
    }

    const activeSession = await Session.findOne({
        classId,
        isActive: true
    });

    if (activeSession) {
        throw new ApiError(409, "An active session already exists for this class");
    }

    const newSession = new Session({
        classId,
        startTime,
        endTime,
        isActive: true
    });

    await newSession.save();

    return res.status(201).json(
        new ApiResponse(201, newSession, "Session started successfully")
    );
});
const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    if (!isValidObjectId(sessionId)) {
        throw new ApiError(400, "Invalid sessionId");
    }
    if (req.user.role !== 'admin') {
        throw new ApiError(403, "Forbidden");
    }
    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }
    if (!session.isActive) {
        throw new ApiError(409, "Session is already inactive");
    }
    session.isActive = false;
    await session.save();

    return res.status(200).json(
        new ApiResponse(200, session, "Session ended successfully")
    );
});
//TODO: session attendance, export attendance

export { createClass, addStudentToClass, startSession, endSession };
