import { Router } from "express";
import { getMe, login, logout } from "../controllers/auth.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";


const router = Router();


router.post("/login",login);
router.post("/logout",logout);
router.get("/me",authenticateJWT,getMe);


export default router;