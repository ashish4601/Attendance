import { Router } from 'express';
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { createClass } from '../controllers/class.controller.js';
const router = Router();

router.route('/classes').post(verifyJWT, verifyAdmin, createClass);
router.route('/classes/:classId/students').post(verifyJWT, verifyAdmin, addStudentToClass);

export default router;