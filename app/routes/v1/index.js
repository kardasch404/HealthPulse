import express from 'express';
import authRoutes from './auth.routes.js';
import rolesRoutes from './roles.routes.js';
import usersRoutes from './users.routes.js';
import terminsRoutes from './termins.routes.js';
import pharmacyRoutes from './pharmacy.routes.js';
import consultationRoutes from './consultation.routes.js';
import prescriptionRoutes from './prescription.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/roles', rolesRoutes);
router.use('/users', usersRoutes);
router.use('/termins', terminsRoutes);
router.use('/pharmacies', pharmacyRoutes);
router.use('/consultations', consultationRoutes);
router.use('/prescriptions', prescriptionRoutes);

export default router;