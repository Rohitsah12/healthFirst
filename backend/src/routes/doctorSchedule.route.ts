import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { deleteDoctorSchedule, getDoctorSchedule, upsertDoctorSchedule } from "../controllers/doctorSchedule.controller.js";

const router = Router();

router.use(authenticateJWT, authorizeRoles("ADMIN", "STAFF"));

router.put("/:doctorId",upsertDoctorSchedule)
router.get("/:doctorId",getDoctorSchedule)
router.delete("/:doctorId",deleteDoctorSchedule)

export default router;