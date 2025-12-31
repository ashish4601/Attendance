import { isValidObjectId } from "mongoose";
import { Class } from "../models/class.models.js";
import { Session } from "../models/session.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createSession = asyncHandler(async (req, res) => {
    const { classId } = req.params;
    const { startTime, endTime, geofence } = req.body;

    if (!isValidObjectId(classId)) {
        throw new ApiError(400, "Invalid classId");
    }

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admin can create sessions");
    }

    if (!startTime || !endTime || new Date(endTime) <= new Date(startTime)) {
        throw new ApiError(400, "Invalid session time window");
    }

    if (!geofence?.lat || !geofence?.lng || !geofence?.radius) {
        throw new ApiError(400, "Session geofence is required");
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

    const classObj = await Class.findById(classId);
    if (!classObj) {
        throw new ApiError(404, "Class not found");
    }

    //Prevent overlapping sessions for same class
    const overlappingSession = await Session.findOne({
        classId,
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });

    if (overlappingSession) {
        throw new ApiError(409, "Overlapping session already exists for this class");
    }

    const session = await Session.create({
        classId,
        startTime,
        endTime,
        geofence,
    });

    return res.status(201).json(
        new ApiResponse(201, session, "Session scheduled successfully")
    );
});
const forceEndSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    if (!isValidObjectId(sessionId)) {
        throw new ApiError(400, "Invalid sessionId");
    }

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admin can end sessions");
    }

    const session = await Session.findById(sessionId);
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    if (new Date() > session.endTime) {
        throw new ApiError(400, "Session has already ended");
    }
    session.endTime = new Date();
    await session.save();
    return res.status(200).json(
        new ApiResponse(200, session, "Session ended successfully")
    );
});


export {
    createSession,
    forceEndSession
};
