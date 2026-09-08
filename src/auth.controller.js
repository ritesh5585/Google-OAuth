import jwt from 'jsonwebtoken';
import userModel from './auth.model.js';
import { config } from './config.js';

const JWT_SECRET = config.JWT || process.env.JWT_SECRET;

const COOKIE_OPTS = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

// ============ HELPER FUNCTIONS ============
const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });

const setCookie = (res, user) => {
    res.cookie('token', createToken(user._id), COOKIE_OPTS);
};

const getUserData = (user) => ({
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    contact: user.contact,
    googleId: user.googleId,
    profilepic: user.profilepic,
});

const successResponse = (res, user, message, status = 200) => {
    setCookie(res, user);
    res.status(status).json({ success: true, message, user: getUserData(user) });
};

const errorResponse = (res, message, status = 500, error = null) => {
    console.error(`❌ ${message}:`, error?.message || '');
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && error && { error: error.message }),
    });
};

// ============ AUTH CONTROLLERS ============

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller = false } = req.body;

    if (!email || !contact || !password || !fullname) {
        return errorResponse(res, 'All fields are required', 400);
    }

    try {
        const existing = await userModel.findOne({
            $or: [{ email: email.toLowerCase() }, { contact }],
        });

        if (existing) {
            const field = existing.email === email.toLowerCase() ? 'Email' : 'Contact';
            return errorResponse(res, `${field} already registered`, 409);
        }

        const user = await userModel.create({
            email: email.toLowerCase(),
            contact,
            password,
            fullname: fullname.trim(),
            role: isSeller ? 'seller' : 'buyer',
        });

        successResponse(res, user, 'Registration successful');

    } catch (err) {
        errorResponse(res, 'Registration failed', 500, err);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return errorResponse(res, 'Email and password required', 400);
    }

    try {
        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (!user || !(await user.comparePassword(password))) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        successResponse(res, user, 'Login successful');

    } catch (err) {
        errorResponse(res, 'Login failed', 500, err);
    }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select('-password');

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        res.status(200).json({ success: true, user: getUserData(user) });

    } catch (err) {
        errorResponse(res, 'Failed to fetch profile', 500, err);
    }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
    res.clearCookie('token', { ...COOKIE_OPTS, maxAge: 0 });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * Google OAuth Callback
 * GET /api/auth/google/callback
 * This is called by Passport after Google authentication
 */
export const googleCallback = async (req, res) => {
    try {
        // req.user comes from Passport's GoogleStrategy
        const { id: googleId, displayName, emails, photos } = req.user;
        const email = emails?.[0]?.value?.toLowerCase();

        if (!email) {
            throw new Error('Email not provided by Google');
        }

        let user = await userModel.findOne({ email });

        if (!user) {
            user = await userModel.create({
                email,
                googleId,
                fullname: displayName || 'Google User',
                profilepic: photos?.[0]?.value || '',
                isVerified: true, 
                role: 'buyer', 
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
        }

        setCookie(res, user);

        const redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(redirectUrl);

    } catch (err) {
        console.error('Google Auth Error:', err);
        const redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(`${redirectUrl}/login?error=google_auth_failed`);
    }
};

/**
 * Forgot password
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return errorResponse(res, 'Email is required', 400);
    }

    try {
        const user = await userModel.findOne({ email: email.toLowerCase() });

        if (user) {

            const token = crypto.getRandomBytes(32).toString("hex")
            // await sendResetEmail(email, token);
        }

        res.status(200).json({
            success: true,
            message: 'If account exists, reset link sent',
        });

    } catch (err) {
        errorResponse(res, 'Failed to process request', 500, err);
    }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return errorResponse(res, 'Token and new password required', 400);
    }

    try {
        const user = userModel.findOne({ resetToken: token})
        if(!user) return errorResponse(res, 'Invalid token', 400);
            user.password = newPassword

            await user.save()
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });

    } catch (err) {
        errorResponse(res, 'Failed to reset password', 500, err);
    }
};