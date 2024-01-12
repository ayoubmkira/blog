import express from "express";
import multer from "multer";
import { renderNewPostForm, getAllPosts, createNewPost, showPost, renderEditFormPost, updatePost, deletePost, likeDislikePost } from "../controllers/posts.js";
import { catchAsyncError, validatePost } from "../../utils/middlewares.js";
import { isLoggedIn, isAuthor } from "../../utils/middlewares.js";

export const router = express.Router();

// 
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/")
    .get(catchAsyncError(getAllPosts))
    .post(isLoggedIn, upload.single("image"), validatePost, catchAsyncError(createNewPost));
router.route("/new")
    .get(isLoggedIn, renderNewPostForm);
router.route("/:id/edit")
    .get(isLoggedIn, isAuthor, catchAsyncError(renderEditFormPost));
router.route("/:id")
    .get(catchAsyncError(showPost))
    .put(isLoggedIn, isAuthor, upload.single("image"), validatePost, catchAsyncError(updatePost))
    .patch(isLoggedIn, catchAsyncError(likeDislikePost))
    .delete(isLoggedIn, isAuthor, catchAsyncError(deletePost));