import { Router } from 'express';
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { createClass,addStudentToClass } from '../controllers/class.controller.js';
const router = Router();

router.route('/add-class').post(verifyJWT, verifyAdmin, createClass);
router.route('/:classId/students').post(verifyJWT, verifyAdmin, addStudentToClass);

export default router;