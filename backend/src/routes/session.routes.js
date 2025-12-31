import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    createSession,
    forceEndSession,
} from "../controllers/session.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);

router.route('/:classId').post(createSession); 
router.route('/:sessionId/end').post(forceEndSession);


export default router;
