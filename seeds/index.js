
import mongoose from "mongoose";
import { Post } from "../server/models/posts.js";
import { User } from "../server/models/users.js";
import { Review } from "../server/models/reviews.js";

mongoose.connect("mongodb://127.0.0.1:27017/blog_db");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const affectReviewsToUsers = async () => {
    const users = await User.find({});
    const reviews = await Review.find({});

    reviews.forEach((review) => {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        review.author = randomUser._id;
        review.save();
    });

    console.log("end");
};
affectReviewsToUsers();