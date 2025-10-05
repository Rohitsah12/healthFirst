import { Router } from "express";
import authRouter from "./auth.route.js";
import staffRouter from "./staff.route.js";
import doctorRouter from "./doctor.route.js";


const router = Router();

router.use("/auth",authRouter);
router.use("/staff",staffRouter);
router.use("/doctor",doctorRouter);


export default router;