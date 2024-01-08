import express from "express";
import { renderRegisterForm, registerUser, renderLoginForm, loginUser, logoutUser } from "../controllers/users.js";
import { catchAsyncError, storeReturnTo } from "../../utils/middlewares.js";
import passport from "passport";

export const router = express.Router();

router.route("/register")
    .get(renderRegisterForm)
    .post(catchAsyncError(registerUser));
router.route("/login")
    .get(renderLoginForm)
    .post(storeReturnTo, passport.authenticate("local", {failureFlash: true, failureRedirect: "/login" }), loginUser);
router.route("/logout")
    .get(logoutUser);