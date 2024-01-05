import mongoose from "mongoose";
import moment from "moment";
import { Review } from "./reviews.js";

const { Schema } = mongoose;
const postSchema = new Schema({
    image: {
        fileId: String,
        url: String,
        thumbnailUrl: String
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }]
});

postSchema.virtual("lastUpdated").get(function () {
    const date = this.updatedAt;
    return moment(date).fromNow();
});

postSchema.post("findOneAndDelete", async function (post) {
    if(post)
        await Review.deleteMany({ _id: { $in: post.reviews } });
});

export const Post = mongoose.model("Post", postSchema);