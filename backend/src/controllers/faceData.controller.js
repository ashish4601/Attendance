
import { isValidObjectId } from "mongoose";
import { FaceData } from "../models/faceData.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getFaceDescriptor } from "../../face_detection/src/calculateEmbedding.js";
const enrollFace = asyncHandler(async (req, res) => {
    const { faceImgBase64 } = req.body;
    if (!faceImgBase64) {
        throw new ApiError(400, "Face image is required");
    }
    if (!req.user || req.user.role !== "student") {
        throw new ApiError(403, "Forbidden");
    }
    let faceData = await FaceData.findOne({ userId: req.user._id });
    if (faceData) {
        throw new ApiError(409, "Face data already enrolled");
    }
    const faceEmbedding = await getFaceDescriptor(faceImgBase64);
     
    faceData = new FaceData({
        userId: req.user._id,
         faceEmbedding: Array.from(faceEmbedding)
    });
    await faceData.save();
    return res.status(201).json(
        new ApiResponse(201, faceData, "Face data enrolled successfully")
    );
});
const getFaceStatus = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "student") {
        throw new ApiError(403, "Forbidden");
    }

    const faceExists = await FaceData.exists({ userId: req.user._id });

    return res.status(200).json(
        new ApiResponse(
            200,
            { isEnrolled: !!faceExists },
            "Face enrollment status retrieved successfully"
        )
    );
});

const resetFaceData = asyncHandler(async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        throw new ApiError(403, "Forbidden");
    }
    const { studentId } = req.params;
    if (!isValidObjectId(studentId)) {
        throw new ApiError(400, "Invalid studentId");
    }
    const faceData = await FaceData.findOneAndDelete({ userId: studentId });
    if (!faceData) {
        throw new ApiError(404, "Face data not found for the student");
    }

    return res.status(200).json(
        new ApiResponse(200, faceData, "Face data reset successfully")
    );
});


export { enrollFace, getFaceStatus, resetFaceData };