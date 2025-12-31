import { Router } from "express";
import { verifyJWT, verifyStudent } from "../middlewares/auth.middleware.js";
import {
    getActiveSessionByClass,
    getMyAttendance,
    getStudentClasses,
} from "../controllers/student.controller.js";

const router = Router();
router.use(verifyJWT);
router.use(verifyStudent);
router.route('/classes').get(getStudentClasses);
router.route('/classes/:classId/active-session').get(getActiveSessionByClass);
router.route('/attendance').get(getMyAttendance);

export default router;