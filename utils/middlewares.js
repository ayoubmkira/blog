import { postSchema, reviewSchema } from "../schemas.js";
import { Post } from "../server/models/posts.js";
import { Review } from "../server/models/reviews.js";
import { ExpressError } from "./expressErrorClass.js";

export const catchAsyncError = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};

export const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        /*
            Store the [returnTo] from session to [returnTo] locals:
        */
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

export const isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        /*
            Store the [originalUrl] into [returnTo] in the session:
        */
        req.session.returnTo = req.originalUrl;

        req.flash("error", "You must be authenticated!");
        return res.redirect("/login");
    }
    next();
};

export const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if(!post.author.equals(req.user._id)) {
        req.flash("error", "You dont't have permission to do that.");
        return res.redirect(`/posts/${id}`);
    }
    next();
};

export const isReviewAuthor = async (req, res, next) => {
    const { id, review_id } = req.params;
    const review = await Review.findById(review_id);

    if(!review.author.equals(req.user._id)) {
        req.flash("error", "You dont't have permission to do that.");
        return res.redirect(`/posts/${id}`);
    }
    next();
};

export const validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    
    if(error) {
        const msg = error.details.map((dtl) => dtl.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

export const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    
    if(error) {
        const msg = error.details.map((dtl) => dtl.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};