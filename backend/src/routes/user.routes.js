import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserProfileImage,
    getUserById
} from "../controllers/user.controller.js";

const router = Router();
router.route("/register").post(
    upload.fields([

        {
            name: "profileImage",
            maxCount: 1
        }

    ]),
    registerUser)

router.route("/login").post(loginUser);

//secure routes
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/me").patch(verifyJWT, updateAccountDetails);
router.route("/user/:userId").get(verifyJWT, getUserById);
router.route("/me/profile-image").patch(verifyJWT, upload.single("profileImage"), updateUserProfileImage);
export default router;

