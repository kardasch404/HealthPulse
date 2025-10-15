import express from 'express';
import AuthController from '../../controllers/AuthController.js';
import AuthService from '../../services/AuthService.js';
import { authenticate } from '../../middlewares/auth.js';

const router = express.Router();

// Instantiate the service and controller
const authService = new AuthService();
const authController = new AuthController(authService);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));

export default router;