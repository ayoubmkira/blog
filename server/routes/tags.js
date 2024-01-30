import express from "express";
import { catchAsyncError } from "../../utils/middlewares.js";
import { createNewTag } from "../controllers/tags.js";

export const router = express.Router();

router.route("/")
    .post(catchAsyncError(createNewTag));