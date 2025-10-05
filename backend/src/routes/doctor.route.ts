import { Router } from "express";

const router = Router();

import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { addDoctor, deleteDoctor, getDoctors, updateDoctor } from "../controllers/doctor.controller.js";

router.use(authenticateJWT,authorizeRoles("ADMIN","STAFF"));
router.post("/",addDoctor);
router.get("/",getDoctors);
router.patch("/:id",updateDoctor);
router.delete("/:id",deleteDoctor);


export default router;  