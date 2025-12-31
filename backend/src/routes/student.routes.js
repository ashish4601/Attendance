import { Router } from "express";
import { verifyJWT, verifyStudent } from "../middlewares/auth.middleware.js";
import {
    getStudentClasses,
} from "../controllers/student.controller.js";

const router = Router();
router.use(verifyJWT);
router.use(verifyStudent);
router.route('/classes').get(getStudentClasses);


export default router;