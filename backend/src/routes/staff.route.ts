import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { addStaff, deleteStaff, getAllStaff, updateStaff } from "../controllers/staff.controller.js";

const router = Router();


router.use(authenticateJWT, authorizeRoles("ADMIN"));
router.post("/", addStaff);
router.get("/", getAllStaff);
router.patch("/:staffId", updateStaff);
router.delete("/:staffId", deleteStaff);

export default router;