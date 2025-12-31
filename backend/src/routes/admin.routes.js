import { Router } from 'express';
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createUserByAdmin,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT);
router.use(verifyAdmin);


// User management
router.post("/create-user", createUserByAdmin);



export default router;