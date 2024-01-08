import express from "express";
import mongoose from "mongoose";
import ejsMate from "ejs-mate";
import path from "path";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import expressSession from "express-session";
import connectFlash from "connect-flash";
import passport from "passport";
import passportLocal from "passport-local";
import { fileURLToPath } from 'url';
import { router as userRoutes } from "./server/routes/users.js";
import { router as postRoutes } from "./server/routes/posts.js";
import { router as reviewRoutes } from "./server/routes/reviews.js";
import { ExpressError } from "./utils/expressErrorClass.js";
import { User } from "./server/models/users.js";

const app = express();
const PORT = 2020;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionConfig = {
    name: "blog_session",
    secret:'blog_session_secret',
    saveUninitialized: true,
    resave: true
};

// Connect to DB:
mongoose.connect("mongodb://127.0.0.1:27017/blog_db");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// Setup Template Engine:
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serving static files:
app.use(express.static(path.join(__dirname, "public")));

// Parse application/json:
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded:
app.use(bodyParser.urlencoded({ extended: true }));

// Method Override:
app.use(methodOverride('_method'));

// Using Flash Messages:
app.use(expressSession(sessionConfig));
app.use(connectFlash());

// Initialize Passport:
app.use(passport.initialize());
app.use(passport.session());
// Use Local Strategy + And Athenticate our "User" Model:
passport.use(new passportLocal(User.authenticate()));

// Serialize user information to the session:
passport.serializeUser(User.serializeUser());
// Deserialize user information from the session:
passport.deserializeUser(User.deserializeUser());

// First Middleware:
app.use((req, res, next) => {
    /*
        [req.user] is set by Passportjs.
        [res.locals.currentUser] Make it accessible inside all ejs Templates.
    */
    res.locals.currentUser = req.user;

    /*
        Pass flash messages to all ejs Templates.
    */
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// User Routes:
app.use("/", userRoutes);
// Post Routes:
app.use("/posts", postRoutes);
// Review Routes:
app.use("/posts/:id/reviews", reviewRoutes);

// Middleware Page not Found:
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not Found!", 404));
});

// Error Middleware:
app.use((error, req, res, next) => {
    const { statusCode = 500, message = "Something went Wrong!" } = error;
    res.status(statusCode).render("error", { message });
});

// Server Listening:
app.listen(PORT, () => {
    console.log(`Server is listening on Port: ${PORT}`);
});