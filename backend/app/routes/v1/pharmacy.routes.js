import express from 'express';
import PharmacyController from '../../controllers/PharmacyController.js';
import PharmacyService from '../../services/PharmacyService.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin, requireRole } from '../../middlewares/permission.js';
import { catchAsync } from '../../middlewares/errorHandler.js';
import { ROLES } from '../../constants/roles.js';

const router = express.Router();

const pharmacyService = new PharmacyService();
const pharmacyController = new PharmacyController(pharmacyService);

router.use(authenticate);

router.post('/', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.registerPharmacy(req, res))
);

router.get('/stats', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.getPharmacyStats(req, res))
);

router.get('/nearby', 
    catchAsync((req, res) => pharmacyController.getNearbyPharmacies(req, res))
);

router.get('/search/services', 
    catchAsync((req, res) => pharmacyController.searchByServices(req, res))
);

router.get('/search', 
    catchAsync((req, res) => pharmacyController.searchPharmacies(req, res))
);

router.get('/', 
    requireRole([ROLES.ADMIN, ROLES.PHARMACIST]),
    catchAsync((req, res) => pharmacyController.getAllPharmacies(req, res))
);

router.get('/:id', 
    requireRole([ROLES.ADMIN, ROLES.PHARMACIST]),
    catchAsync((req, res) => pharmacyController.getPharmacyById(req, res))
);

router.put('/:id', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.updatePharmacy(req, res))
);

router.delete('/:id', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.deletePharmacy(req, res))
);

router.patch('/:id/activate', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.activatePharmacy(req, res))
);

router.patch('/:id/suspend', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.suspendPharmacy(req, res))
);

router.patch('/:id/verify', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.verifyPharmacy(req, res))
);

router.post('/:id/pharmacists', 
    requireAdmin,
    catchAsync((req, res) => pharmacyController.addPharmacist(req, res))
);

export default router;