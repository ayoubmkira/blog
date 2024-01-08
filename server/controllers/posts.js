import mongoose from "mongoose";
import path from "path";
import { Post } from "../models/posts.js";
import { ExpressError } from "../../utils/expressErrorClass.js";
import { imagekit } from "../../imagekit/index.js";
import { checkObjectIdValidity } from "../../utils/functions.js";

export const getAllPosts = async (req, res) => {
    const posts = await Post.find({});
    res.render("posts/index", { posts });
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
    await post.save();

    req.flash("success", "A new Post was created.");
    res.redirect("/posts");
};

export const showPost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findById(id).populate("reviews");
    if(!post) {
        req.flash("error", "Cannot find that Post!!");
        return res.redirect("/posts");
    }

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