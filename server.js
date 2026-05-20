import { config } from "dotenv";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import buildPage from "./builPage.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Load environment variables from the .env file
config();

const app = express();

app.use(morgan("dev"));

app.use(passport.initialize());

const hasCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;

// 1. Configure the Google OAuth Passport Strategy
if (hasCredentials) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK || "/auth/google/callback",
    }, (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
    }));
} else {
    console.warn("WARNING: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are missing in your .env file.");
}

// 2. Route: Serve the Landing / Dashboard Page
app.get("/", (req, res) => {
    const { id, name, email, photo } = req.query;
    
    let user = null;
    if (id) {
        user = { id, name, email, photo };
    }

    res.send(buildPage({ user }));
});

// 3. Route: Trigger Google Sign-In Flow
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

// 4. Route: Google OAuth Redirect Callback Destination
app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false, // use URL query params instead of heavy server-side sessions
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

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});