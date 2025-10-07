import { Router } from 'express';
import { addVisit, exportVisitHistoryExcel, getDoctorVisitHistory, getPatientVisitHistory, getVisitHistory } from '../controllers/visit.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';
import { getDoctorsOnDate, getPatientsOnDate } from '../service/visit.service.js';

const router = Router();

router.use(authenticateJWT, authorizeRoles(UserRole.STAFF, UserRole.ADMIN));

router.post("/", addVisit);
router.get("/history", getVisitHistory);

router.get("/history/export", exportVisitHistoryExcel);

router.get("/patient/:patientId/history", getPatientVisitHistory);

router.get("/doctor/:doctorId/history", getDoctorVisitHistory);
router.get("/patients-on-date", getPatientsOnDate);
router.get("/doctors-on-date", getDoctorsOnDate);
export default router;