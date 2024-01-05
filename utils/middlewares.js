import { postSchema, reviewSchema } from "../schemas.js";
import { ExpressError } from "./expressErrorClass.js";

export const catchAsyncError = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
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