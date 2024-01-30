import mongoose from "mongoose";
import path from "path";
import { User } from "../models/users.js";
import { Post } from "../models/posts.js";
import { ExpressError } from "../../utils/expressErrorClass.js";
import { imagekit } from "../../imagekit/index.js";
import { checkObjectIdValidity } from "../../utils/functions.js";
import { Tag } from "../models/tags.js";

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
        posts = await Post.find(query).populate("author").populate("tags");
    } else {
        posts = await Post.find({}).populate("author").populate("tags");
    }

    res.render("posts/index", { posts, search });
};

export const renderNewPostForm = async (req, res) => {
    const tags = await Tag.find({});

    res.render("posts/new", { tags });
};

export const createNewPost = async (req, res) => {
    const { title, body, tags: tagsNames = [] } = req.body.post;
    const post = new Post({ title, body });
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

    // Check if any tag Name was Chosen:
    if (tagsNames.length) {
        // Options for the update operation
        const options = {
            upsert: true, // Creates the document if it doesn't exist
            runValidators: true, // Ensures the update adheres to schema validation
        };

        // Prepare an array of update operations
        const bulkOperations = tagsNames.map((tagName) => {
            const query = { name: tagName };
            const update = {
                $push: { posts: post._id },
                $setOnInsert: {
                    name: tagName
                }
            };

            return {
                updateOne: {
                    filter: query,
                    update: update,
                    upsert: options.upsert
                }
            };
        });

        // Use bulkWrite to execute the operations in a single call
        const result = await Tag.bulkWrite(bulkOperations, { ordered: false });

        // Add Tags Ids into the Post:
        const savedTags = await Tag.find({ name : { $in: tagsNames } }).select("_id");
        post.tags.push(...savedTags.map(tag => tag._id));
    }

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

    // Increment number of views:
    post.views +=1;
    post.save();

    res.render("posts/show", { post });
};

export const renderEditFormPost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findById(id);
    const tags = await Tag.find({});

    res.render("posts/edit", { post, tags });
};

export const updatePost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);
    const { title, body, tags = [] } = req.body.post;

    const post = await Post.findByIdAndUpdate(id, {
        title,
        body,
        updatedAt: new Date()
    }, { checkObjectIdValidity: true }).populate("tags");

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

    //=======================================================================================//
    // Names of Tags for current Post Before Updating:
    const postTagsNames = post.tags.map((tag) => tag.name); // ["a", "b", "c"]
    // Names of Tags coming from Edit Form:
    const tagsNames = tags; // ["b", "c", "d"] = We remove "a" tag, and Add "d" tag.
    // All Previous Tags Names in One Array:
    const allTagsNames = Array.from(new Set([...postTagsNames, ...tagsNames])); // ["a", "b", "c", "d"]

    const tagsToDelete = []; // ["a"]
    const tagsToAddOrUpdate = []; // ["d"]

    // Filter Tags to be deleted from the ones to be Added:
    allTagsNames.forEach((tagName) => {
        if (postTagsNames.includes(tagName) && !tagsNames.includes(tagName)) {
            tagsToDelete.push(tagName);
        } else if (!postTagsNames.includes(tagName) && tagsNames.includes(tagName)) {
            tagsToAddOrUpdate.push(tagName);
        }
    });

    if(tagsToDelete.length || tagsToAddOrUpdate.length) {
        // Options for the update operation:
        const options = {
            upsert: true, // Creates the document if it doesn't exist
            runValidators: true, // Ensures the update adheres to schema validation
        };

        let bulkDeleteOperations = [];
        let bulkAddOperations = [];

        if(tagsToDelete.length) {
            // Arrange Operations for Tags to be Deleted:
            bulkDeleteOperations = tagsToDelete.map((tagName) => {
                const query = { name: tagName };
                const update = {
                    $pull: { posts: post._id }
                };
                return {
                    updateOne: {
                        filter: query,
                        update: update
                    }
                };
            });
        }

        if(tagsToAddOrUpdate.length) {
            // Arrange Operations for Tags to be Added:
            bulkAddOperations = tagsToAddOrUpdate.map((tagName) => {
                const query = { name: tagName };
                const update = {
                    $push: { posts: post._id },
                    $setOnInsert: {
                        name: tagName
                    }
                };
                return {
                    updateOne: {
                        filter: query,
                        update: update,
                        upsert: options.upsert
                    }
                };
            });
        }

        // Use bulkWrite to execute the operations in a single call:
        await Tag.bulkWrite([...bulkDeleteOperations, ...bulkAddOperations], { ordered: false });
    }

    if(tagsToDelete.length || tagsToAddOrUpdate.length) {
        // Get All Tags From DB:
        const newTags = await Tag.find({ name: { $in: [...tagsToDelete, ...tagsToAddOrUpdate] } });

        // Get Tags IDs:
        const tagsIdsToPush = newTags.filter(tag => tagsToAddOrUpdate.includes(tag.name)).map(tag => tag._id);
        const tagsIdsToPull = newTags.filter(tag => tagsToDelete.includes(tag.name)).map(tag => tag._id);

        // Make Updates on current Post Tags IDs Field:
        if(tagsIdsToPush.length)
            await Post.findByIdAndUpdate(id, { $push: { tags: { $each: tagsIdsToPush } } });
        if(tagsIdsToPull.length)
            await Post.findByIdAndUpdate(id, { $pull: { tags: { $in: tagsIdsToPull } } });
    }
    //=======================================================================================//

    req.flash("success", "The post was updated Successfully.");
    res.redirect(`/posts/${id}`);
};

export const deletePost = async (req, res) => {
    const { id } = req.params;
    checkObjectIdValidity(id);

    const post = await Post.findByIdAndDelete(id);

    // Check if some Post is Deleted:
    if(post.image.fileId) {
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
        return res.status(404).json({ error: "Post not Found!" });
    }

    // Check if Current User Likes the Post Already:
    if(post.likedByUsers.includes(req.user._id)) {
        await post.updateOne({ $pull: { likedByUsers: req.user._id } });
        res.json({ message: "Post was Unliked." });
    } else {
        post.likedByUsers.push(req.user._id);
        await post.save();
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

export const getPostsByTag = async (req, res) => {
    const { tag_id } = req.params;
    const tag = await Tag.findById(tag_id).populate({
        path: "posts",
        populate: {
            path: "author"
        }
    });

    res.render("posts/tag_posts", { tag });
};