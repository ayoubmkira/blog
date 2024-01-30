import Joi from "joi";

export const postSchema = Joi.object({
    post: Joi.object({
        image: Joi.object({
            fileId: Joi.string(),
            url: Joi.string().uri(),
            thumbnailUrl: Joi.string().uri()
        }),
        title: Joi.string().trim().min(3).required(),
        body: Joi.string().trim().min(10).required(),
        tags: Joi.array().items(Joi.string())
    }).required()
});

export const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(0).max(5).required(),
        body: Joi.string().trim().min(3).required()
    }).required()
});