import e, { Router } from "express";
import { verifyJWT, verifyStudent, verifyAdmin } from "../middlewares/auth.middleware.js";


import { enrollFace, getFaceStatus, resetFaceData } from "../controllers/faceData.controller.js";

const router = Router();
router.use(verifyJWT);
router.route('/enroll').post(verifyStudent, enrollFace);
router.route('/status').get(verifyStudent, getFaceStatus);
router.route('/reset/:studentId').delete(verifyAdmin, resetFaceData);

export default router;