import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cookieParser from "cookie-parser";
import buildPage from "./buildPage.js";
import authRouter from "./src/routes.js";
import { config } from "./src/config.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

const hasCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
    proxy: true
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

// Login Page
app.get("/", (req, res) => {
    const { id, name, email, photo, error, success } = req.query;
    const user = id ? { id, name, email, photo } : null;
    res.send(buildPage({ user, page: 'login', error, success }));
});

// Register Page
app.get("/register", (req, res) => {
    const { error, success } = req.query;
    res.send(buildPage({ user: null, page: 'register', error, success }));
});

// Dashboard Page (Protected)
app.get("/dashboard", (req, res) => {
    const { id, name, email, photo, error, success } = req.query;
    const user = id ? { id, name, email, photo } : null;
    if (!user) {
        return res.redirect('/?error=Please login first');
    }
    res.send(buildPage({ user, page: 'dashboard', error, success }));
});

// Profile Page (Protected)
app.get("/profile", (req, res) => {
    const { id, name, email, photo, error, success } = req.query;
    const user = id ? { id, name, email, photo } : null;
    if (!user) {
        return res.redirect('/?error=Please login first');
    }
    res.send(buildPage({ user, page: 'profile', error, success }));
});

// Forgot Password Page
app.get("/forgot-password", (req, res) => {
    const { error, success } = req.query;
    res.send(buildPage({ user: null, page: 'forgot', error, success }));
});

// Reset Password Page
app.get("/reset-password", (req, res) => {
    const { token, error, success } = req.query;
    if (!token) {
        return res.redirect('/forgot-password?error=Invalid reset link');
    }
    res.send(buildPage({ user: null, page: 'reset', error, success }));
});

// Initiate Google Login
app.get(
    "/auth/google",
    (req, res, next) => {
        if (!hasCredentials) {
            return res.send(buildPage({
                user: null,
                page: 'login',
                error: 'Google OAuth not configured. Please check your .env file.'
            }));
        }
        next();
    },
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/?error=Google authentication failed"
    }),
    (req, res) => {
        const user = req.user;
        const id = user.id || "";
        const name = user.displayName || "";
        const email = user.emails?.[0]?.value || "";
        const photo = user.photos?.[0]?.value || "";

        // Check if user has role, if not set default
        const role = user.role || 'buyer';

        res.redirect(`/dashboard?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&photo=${encodeURIComponent(photo)}&role=${encodeURIComponent(role)}&success=Welcome%20${encodeURIComponent(name)}!`);
    }
);
app.use('/api/auth', authRouter);

app.use((req, res) => {
    res.status(404).send(buildPage({
        user: null,
        page: 'login',
        error: 'Page not found'
    }));
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n🚀 =========================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('🚀 =========================================');
    console.log(`📧 Login:      http://localhost:${PORT}/`);
    console.log(`📝 Register:   http://localhost:${PORT}/register`);
    console.log(`🔑 Forgot:     http://localhost:${PORT}/forgot-password`);
    console.log(`📊 Dashboard:  http://localhost:${PORT}/dashboard`);
    console.log(`👤 Profile:    http://localhost:${PORT}/profile`);
    console.log('🚀 =========================================\n');
});