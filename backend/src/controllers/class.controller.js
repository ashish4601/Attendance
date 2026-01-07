import { isValidObjectId } from "mongoose";
import { Class } from "../models/class.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const createClass = asyncHandler(async (req, res) => {
    const { name, description} = req.body;

    if (!name) {
        throw new ApiError(400, "Name and geofence (lat, lng, radius) are required");
    }

    if (!req.user || !isValidObjectId(req.user._id) || req.user.role !== 'admin') {
        throw new ApiError(401, "Unauthorized");
    }

    const newClass = new Class({
        name,
        description,
        createdBy: req.user._id,
        students: []
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
    const { studentEmail } = req.body;


    if (!isValidObjectId(classId) || req.user.role !== 'admin') {
        throw new ApiError(400, "Invalid classId ");
    }

    const classObj = await Class.findById(classId);
    if (!classObj) {
        throw new ApiError(404, "Class not found");
    }

    if (!studentEmail) {
        throw new ApiError(400, "Student email is required");
    }
    // Simulate fetching user by email
    const studentUser = await User.findOne({ email: studentEmail });
    if (!studentUser) {
        throw new ApiError(404, "Student user not found");
    }
    if (classObj.students.includes(studentUser._id)) {
        throw new ApiError(409, "Student already enrolled in the class");
    }
    classObj.students.push(studentUser._id);
    await classObj.save();

    return res.status(200).json(
        new ApiResponse(200, classObj, "Student added to class successfully")
    );
});

const getClassesByCreator = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Only admin can access this resource");
    }
    const classes = await Class.find({ createdBy: req.user._id });
    return res.status(200).json(
        new ApiResponse(200, classes, "Classes fetched successfully")
    );
});




export { createClass, addStudentToClass , getClassesByCreator };