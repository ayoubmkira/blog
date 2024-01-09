import express from "express";
import { createNewReview, deleteReview } from "../controllers/reviews.js";
import { catchAsyncError, isLoggedIn, isReviewAuthor, validateReview } from "../../utils/middlewares.js";

export const router = express.Router({mergeParams: true});

router.route("/")
    .post(isLoggedIn, validateReview, catchAsyncError(createNewReview));
router.route("/:review_id")
    .delete(isLoggedIn, isReviewAuthor, catchAsyncError(deleteReview));