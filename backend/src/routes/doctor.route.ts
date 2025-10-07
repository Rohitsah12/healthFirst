import { Router } from "express";

const router = Router();

import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
  addDoctor, 
  deleteDoctor, 
  getDoctors, 
  getDoctorById,
  updateDoctor, 
  getAvailableDoctorsByDay
} from "../controllers/doctor.controller.js";

router.use(authenticateJWT, authorizeRoles("ADMIN", "STAFF"));

router.post("/", addDoctor);
router.get("/", getDoctors);
router.get("/available-by-day", getAvailableDoctorsByDay);
router.get("/:doctorId", getDoctorById);
router.patch("/:doctorId", updateDoctor);
router.delete("/:doctorId", deleteDoctor);


export default router;