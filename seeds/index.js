
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

const affectPostsToUsers = async () => {
    
    // Get all Users:
    const users = await User.find();

    await users.forEach(async (user) => {
        const userPosts = await Post.find({ author: user._id });
        const userPostsIds = userPosts.map(post => post._id);
        user.posts.push(...userPostsIds);
        user.save();
    });

    console.log("DONE");

};

// affectPostsToUsers();

const emptyUsersPosts = async () => {
    await User.updateMany({}, { posts: [] });
};
// emptyUsersPosts();