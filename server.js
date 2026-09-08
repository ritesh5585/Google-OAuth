import express from "express";
import morgan from "morgan";
import buildPage from "./builPage.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./src/config.js";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes.js"

const app = express();

// Added urlencoded middleware properly
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Fixed: added express. before urlencoded
app.use(cookieParser());
app.use(passport.initialize());

const hasCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// 1. Configure the Google OAuth Passport Strategy
passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    proxy: true
}, (_, __, profile, done) => done(null, profile)));

// Route: Serve the Landing / Dashboard Page
app.get("/", (req, res) => {
    const { id, name, email, photo } = req.query;

    let user = null;
    if (id) {
        user = { id, name, email, photo };
    }

    res.send(buildPage({ user }));
});

// Route: Trigger Google Sign-In Flow
app.get(
    "/auth/google",
    (req, res, next) => {
        if (!hasCredentials) {
            return res.status(400).send("Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.");
        }
        next();
    },
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Route: Google OAuth Redirect Callback Destination
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/"
    }),
    (req, res) => {
        const id = req.user.id || "";
        const name = req.user.displayName || "";
        const email = req.user.emails?.[0]?.value || "";
        const photo = req.user.photos?.[0]?.value || "";

        res.redirect(`/?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&photo=${encodeURIComponent(photo)}`);
    }
);

app.use('/api/auth', authRouter);

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});