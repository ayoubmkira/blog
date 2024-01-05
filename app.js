import express from "express";
import mongoose from "mongoose";
import ejsMate from "ejs-mate";
import path from "path";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import expressSession from "express-session";
import connectFlash from "connect-flash";
import { fileURLToPath } from 'url';
import { router as postRoutes } from "./server/routes/posts.js";
import { router as reviewRoutes } from "./server/routes/reviews.js";
import { ExpressError } from "./utils/expressErrorClass.js";

import { imagekit } from "./imagekit/index.js";

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

// Flash Middleware:
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


// Post Routes:
app.use("/posts", postRoutes);

// Review Routes:
app.use("/posts/:id/reviews", reviewRoutes);


// Just Test (Purge Cache):
// app.use("/temp", async (req, res) => {
//     await imagekit.purgeCache("https://ik.imagekit.io/obgexhgrs6/tr:n-ik_ml_thumbnail/zzz_f1wgNuL3P.jpg", function(error, result) { 
//         if(error) console.log(error);
//         else console.log(result);
//     });
//     res.send("OK");
// });


// Middleware Page not Found:
app.all("*", (req, res, next) => {
    next(new ExpressError("Page not Found!", 404));
});

// Error Middleware:
app.use((error, req, res, next) => {
    const { statusCode = 500, message = "Something went Wrong!" } = error;
    res.status(statusCode).render("error", { message });
});


app.listen(PORT, () => {
    console.log(`Server is listening on Port: ${PORT}`);
});