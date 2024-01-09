import mongoose from "mongoose";

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

export const Review = mongoose.model("Review", reviewSchema);