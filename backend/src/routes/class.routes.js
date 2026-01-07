import { Router } from 'express';
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { createClass,addStudentToClass,getClassesByCreator } from '../controllers/class.controller.js';
import { getSessionByClass } from '../controllers/session.controller.js';
const router = Router();

router.route('/add-class').post(verifyJWT, verifyAdmin, createClass);
router.route('/:classId/students').post(verifyJWT, verifyAdmin, addStudentToClass);
router.route('/getclassesbycreator').get(verifyJWT, verifyAdmin, getClassesByCreator);
router.route('/:classId/sessions').get(verifyJWT, verifyAdmin, getSessionByClass);
export default router;