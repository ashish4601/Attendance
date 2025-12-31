import { Router } from "express";

import { verifyJWT, verifyStudent, verifyAdmin } from "../middlewares/auth.middleware.js";
import { getSessionAttendance, markAttendance } from "../controllers/attendance.controller.js";


const router = Router();

router.use(verifyJWT);
router.route('attendance').post(verifyStudent, markAttendance);
router.route('attendance/sessions/:sessionId').get(verifyAdmin, getSessionAttendance);
export default router;
