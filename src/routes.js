import { Router } from 'express';
import { authenticateUser } from './auth.middleware.js';
import { validateRegister, validateLogin } from './auth.validator.js';
import {
    register,
    login,
    getMe,
    logout,
    googleCallback,
    forgotPassword,
    resetPassword,
} from './auth.controller.js';

const router = Router();

// Register & Login
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Password Management
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// These routes require authentication (JWT token)
router.get('/me', authenticateUser, getMe);
router.post('/logout', authenticateUser, logout);

// ============ GOOGLE OAUTH ROUTES ============
// These are handled by Passport
// The callback is automatically called by Google after authentication
router.get('/google/callback', googleCallback);

export default router;