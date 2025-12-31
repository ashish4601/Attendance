import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };


    } catch (error) {
        throw new ApiError(500, "Error generating tokens");

    }
}



//only student
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation
    //check if user already exists

    const { name, email, password } = req.body;

    if (
        [name, email, password].some((field) => field?.trim() === "" || field == null || field == undefined)

    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }]
    });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists.");
    }



    let profileImageLocalPath;
    if (req.files && Array.isArray(req.files.profileImage) && req.files.profileImage.length > 0) {
        profileImageLocalPath = req.files.profileImage[0].path;

    }


    const profileImage = await uploadOnCLoudinary(profileImageLocalPath);



    const user = await User.create({
        name,
        profileImage: profileImage?.url || "",
        email,
        password,
        role: 'student',

    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User Registered Successfully"));

});

const loginUser = asyncHandler(async (req, res) => {
    //req body -> data
    //can login through email
    //find user
    //check pass
    // create access and refress token
    // send cookies (secure)
    if (!req.body) {
        throw new ApiError(400, "Invalid request body");
    }
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({
        email: email
    })
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        },
            "User logged in successfully.")
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    //clear cookies
    //remove refresh token from db
    await User.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            refreshToken: 1
        }
    }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "user logged out"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req?.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized access - Refresh token is required");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Unauthorized access - Invalid refresh token");
        }
        if (user?.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized access - Refresh token mismatch");
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newrefreshToken }, "Access token refreshed successfully")
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized access - Invalid refresh token");
    }




})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Current password is incorrect");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));



})


const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password -refreshToken")
        .populate("classes");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched"));
});



const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        throw new ApiError(400, "Name and email are required");
    }
    const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (existingUser) {
        throw new ApiError(409, "Email already in use");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        { $set: { name, email } },
        { new: true }
    ).select("-password -refreshToken");
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
})



const updateUserProfileImage = asyncHandler(async (req, res) => {
    const profileImageLocalPath = req.file?.path;
    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile image is required");
    }
    const profileImage = await uploadOnCLoudinary(profileImageLocalPath);
    if (!profileImage || !profileImage.url) {
        throw new ApiError(400, "Profile image upload failed");
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { profileImage: profileImage.url }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Profile image updated successfully"));
})

const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"));
});
export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserProfileImage,
    getUserById


};