import { Router } from "express";
import authRouter from "./auth.route.js";
import staffRouter from "./staff.route.js";
import doctorRouter from "./doctor.route.js";
import doctorScheduleRouter from "./doctorSchedule.route.js";
import patientRouter from "./patient.route.js";
import queueRouter from "./queue.route.js";
import visitsRouter from "./visit.route.js";
import dashboardRouter from "./dashboard.route.js";

const router = Router();

router.use("/auth",authRouter);
router.use("/staff",staffRouter);
router.use("/doctor",doctorRouter);
router.use("/doctor-schedule",doctorScheduleRouter)
router.use("/patient",patientRouter);
router.use("/queue",queueRouter);
router.use("/visits",visitsRouter);
router.use("/dashboard",dashboardRouter);


export default router;