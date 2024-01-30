import mongoose from "mongoose";
import moment from "moment";
import { Review } from "./reviews.js";
import { User } from "./users.js";
import { Tag } from "./tags.js";

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
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    views: {
        type: Number,
        default: 0
    },
    likedByUsers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    tags: [{
        type: Schema.Types.ObjectId,
        ref: "Tag"
    }]
});

postSchema.virtual("lastUpdated").get(function () {
    const date = this.updatedAt;
    return moment(date).fromNow();
});

postSchema.post("findOneAndDelete", async function (post) {
    if(post) {
        // Delete All Reviews of the Post:
        await Review.deleteMany({ _id: { $in: post.reviews } });
        // Delete Post ID from User Collection:
        await User.findByIdAndUpdate(post.author, { $pull: { posts: post._id }});
        // Delete Post ID from Tag Collection:
        await Tag.updateMany({ _id: { $in: post.tags } }, { $pull: { posts: post._id }});
    }
});

export const Post = mongoose.model("Post", postSchema);