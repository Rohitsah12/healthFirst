import express from "express";
import { addPatient, deletePatient, getPatientById, getPatients, updatePatient } from "../controllers/patient.controller.js";

const router = express.Router();

router.post("/", addPatient);
router.get("/", getPatients);
router.get("/:patientId", getPatientById);
router.patch("/:patientId", updatePatient);
router.delete("/:patientId", deletePatient);

export default router;
