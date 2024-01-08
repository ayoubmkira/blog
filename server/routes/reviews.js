import express from "express";
import { createNewReview, deleteReview } from "../controllers/reviews.js";
import { catchAsyncError, validateReview } from "../../utils/middlewares.js";

export const router = express.Router({mergeParams: true});

router.route("/")
    .post(validateReview, catchAsyncError(createNewReview));
router.route("/:review_id")
    .delete(catchAsyncError(deleteReview));