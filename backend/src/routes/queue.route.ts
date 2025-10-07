import { Router } from 'express';
import { getActiveQueue, updateVisitStatus } from '../controllers/queue.controller.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticateJWT, authorizeRoles(UserRole.STAFF, UserRole.ADMIN));

router.get("/", getActiveQueue);
router.patch("/:visitId/status", updateVisitStatus);

export default router;