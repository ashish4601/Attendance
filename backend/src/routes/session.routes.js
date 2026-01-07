import { Router } from "express";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import {
    createSession,
    forceEndSession,

    getSessionByCreator
} from "../controllers/session.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);

router.route('/:classId').post(createSession);
router.route('/:sessionId/end').post(forceEndSession);

router.route('/mine').get(getSessionByCreator);


export default router;
