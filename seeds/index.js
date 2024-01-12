
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

const putViewsProperty = async () => {
    const result = await Post.updateMany({}, {views: 0});
    console.log(result);
};

putViewsProperty();