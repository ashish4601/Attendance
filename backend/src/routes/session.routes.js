import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    createSession,
    forceEndSession,
} from "../controllers/session.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);

router.route('/sessions').post(createSession);
router.route('/sessions/:sessionId/end').post(forceEndSession);


export default router;
