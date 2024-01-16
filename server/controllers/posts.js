import mongoose from "mongoose";
import path from "path";
import { User } from "../models/users.js";
import { Post } from "../models/posts.js";
import { ExpressError } from "../../utils/expressErrorClass.js";
import { imagekit } from "../../imagekit/index.js";
import { checkObjectIdValidity } from "../../utils/functions.js";

export const getAllPosts = async (req, res) => {
    let { search } = req.query;
    let posts;

    if(search) {
        const query = {
            $or: [
                { body: { $regex: search, $options: 'i' } },
                { title: { $regex: search, $options: 'i' } }
            ]
        };
        posts = await Post.find(query).populate("author");
    } else {
        posts = await Post.find({}).populate("author");
    }

    res.render("posts/index", { posts, search });
};

export const renderNewPostForm = (req, res) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must be authenticated!");
        return res.redirect("/login");
    }
    res.render("posts/new");
};

export const createNewPost = async (req, res) => {
    const post = new Post(req.body.post);
    const file = req.file;

    // Throw Error if there is no File or the File in not an Image:
    if(!file || !file.mimetype.startsWith("image/")) {
        throw new ExpressError("The File must be an Image!!", 422);
    }
    // Upload the Image:
    const { fileId, url, thumbnailUrl } = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
    });
    // Add image to the Post:
    post.image = { fileId, url, thumbnailUrl };

    /*
        Affect current LoggedIn User to the Post.
        [rep.user._id] is maked by Passport.
    */
    post.author = req.user._id;

    // Save the New Post:
    await post.save();

    // Add Post ID to User Document:
    await User.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });

    req.flash("success", "A new Post was created.");
    res.redirect("/posts");
};

export const showPost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findById(id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if(!post) {
        req.flash("error", "Cannot find that Post!!");
        return res.redirect("/posts");
    }

    // Increment number of views:
    post.views +=1;
    post.save();

    res.render("posts/show", { post });
};

export const renderEditFormPost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findById(id);
    if(!post) {
        req.flash("error", "Cannot find that Post!!");
        return res.redirect("/posts");
    }

    res.render("posts/edit", { post });
};

export const updatePost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findByIdAndUpdate(id, { ...req.body.post, updatedAt: new Date() }, { checkObjectIdValidity: true });

    // Check if there is a new Image:
    if(req.file) {
        const file = req.file;
        // Throw Error if there is no File or the File in not an Image:
        if(!file || !file.mimetype.startsWith("image/")) {
            throw new ExpressError("The File must be an Image!!", 422);
        }

        // Delete previous Image:
        await imagekit.deleteFile(post.image.fileId, async (error, result) => {
            if(error)
                console.log("ERROR IMAGE NOT FOUND !!");
        });
        // Upload the new Image:
        const { fileId, url, thumbnailUrl } = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
        });
        // Add image to the Post:
        post.image = { fileId, url, thumbnailUrl };
        await post.save();
    }

    req.flash("success", "The post was updated Successfully.");
    res.redirect(`/posts/${id}`);
};

export const deletePost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findByIdAndDelete(id);

    // Check if some Post is Deleted:
    if(!post) {
        req.flash("error", "The Post was not found!!");
    } else {
        await imagekit.deleteFile(post.image.fileId, async (error, result) => {
            if(error)
                console.log("ERROR IMAGE NOT FOUND !!");
        });
        req.flash("success", "The post was deleted Successfully.");
    }
    res.redirect(`/posts`);
};

export const likeDislikePost = async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);

    if(!post) {
        req.flash("success", "No Post was found!!");
        return res.json({ message: "Post not Found." }).redirect(`/posts/${id}`);
    }

    // Check if Current User Likes the Post Already:
    if(post.likedByUsers.includes(req.user._id)) {
        await post.updateOne({ $pull: { likedByUsers: req.user._id } });
        // req.flash("success", "You dislike this Post.");
        res.json({ message: "Post was Unliked." });
    } else {
        post.likedByUsers.push(req.user._id);
        await post.save();
        // req.flash("success", "You like this Post.");
        res.json({ message: "Post was Liked." });
    }
};

export const getPostsByUser = async (req, res) => {
    const { user_id } = req.params;
    const user = await User.findById(user_id).populate({
        path: "posts"
    });

    res.render("posts/user_posts", { user });

};