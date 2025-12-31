import { isValidObjectId } from "mongoose";
import { Class } from "../models/class.models.js";
import { Session } from "../models/session.models.js";
import { Attendance } from "../models/attendance.models.js";
import { FaceData } from "../models/faceData.models.js";
import { haversineDistance } from "../utils/geolocation.js";
import { cosineSimilarity } from "../utils/faceRecognition.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const markAttendance = asyncHandler(async (req, res) => {
    const { classId, sessionId, faceEmbedding, blinkVerified, location } = req.body;
    if (!isValidObjectId(classId) || !isValidObjectId(sessionId)) {
        throw new ApiError(400, "Invalid classId or sessionId");
    }

    if (!Array.isArray(faceEmbedding) || faceEmbedding.length === 0) {
        throw new ApiError(400, "Invalid faceEmbedding");
    }

    if (blinkVerified !== true) {
        throw new ApiError(403, "Blink verification failed");
    }

    if (
        !location ||
        typeof location.lat !== "number" ||
        typeof location.lng !== "number"
    ) {
        throw new ApiError(400, "Invalid location");
    }

    if (!req.user || req.user.role !== "student") {
        throw new ApiError(401, "Unauthorized");
    }


    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (session.classId.toString() !== classId) {
        throw new ApiError(403, "Session does not belong to this class");
    }


    const now = new Date();
    if (now < session.startTime || now > session.endTime) {
        throw new ApiError(403, "Session is not currently active");
    }


    const classObj = await Class.findOne({
        _id: classId,
        students: req.user._id
    });

    if (!classObj) {
        throw new ApiError(403, "Student not enrolled in class");
    }


    const alreadyMarked = await Attendance.findOne({
        userId: req.user._id,
        sessionId
    });

    if (alreadyMarked) {
        throw new ApiError(409, "Attendance already marked");
    }


    const distance = haversineDistance(
        location.lat,
        location.lng,
        session.geofence.lat,
        session.geofence.lng
    );

    if (distance > session.geofence.radius || location.accuracy > 50) {
        throw new ApiError(403, "Outside geofence");
    }


    const faceData = await FaceData.findOne({ userId: req.user._id });
    if (!faceData) {
        throw new ApiError(403, "Face not enrolled");
    }

    const similarity = cosineSimilarity(faceEmbedding, faceData.embedding);

    if (similarity < 0.8) {
        throw new ApiError(403, "Face mismatch");
    }


    const attendance = await Attendance.create({
        userId: req.user._id,
        classId,
        sessionId,
        markedAt: new Date(),
        status: "accepted",
        similarityScore: similarity
    });

    return res.status(201).json(
        new ApiResponse(201, attendance, "Attendance marked successfully")
    );
});

const getSessionAttendance = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    if (!isValidObjectId(sessionId)) {
        throw new ApiError(400, "Invalid sessionId");
    }

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden");
    }

    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    //  Verify admin owns the class
    const classObj = await Class.findOne({
        _id: session.classId,
        createdBy: req.user._id
    });

    if (!classObj) {
        throw new ApiError(403, "You are not authorized to view this session");
    }
    //attendance records
    const attendanceRecords = await Attendance.find({ sessionId })
        .populate("userId", "name email");

    return res.status(200).json(
        new ApiResponse(
            200,
            attendanceRecords,
            "Session attendance fetched successfully"
        )
    );
});


export { markAttendance , getSessionAttendance };
