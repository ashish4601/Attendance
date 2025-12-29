import { Router } from 'express';
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router();


router.use(verifyJWT);
router.use(verifyAdmin);


router
    .route('/createClasses').post(createClass)
    .route('/addStudent/:classId').post(addStudentToClass)
    .route('/startSession/:classId').post(startSession)
    .route('/endSession/:sessionId').post(endSession);


export default router;