
import mongoose from "mongoose";
import { Post } from "../server/models/posts.js";

mongoose.connect("mongodb://127.0.0.1:27017/blog_db");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const createPost = async () => {
    const post = new Post({
        title: "Post 3",
        body: "Post 3 body."
    });
    
    await post.save();
};

createPost();