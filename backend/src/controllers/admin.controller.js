import { isValidObjectId } from "mongoose";
import { Class } from "../models/class.models.js";
import { Session } from "../models/session.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const createUserByAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!["student", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    });

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created by admin")
    );
});


//TODO: session attendance, export attendance

export { createUserByAdmin };
