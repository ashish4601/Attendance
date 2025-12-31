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

//TODO: get attendance status


export {
    getStudentClasses,
    

}