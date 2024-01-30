import express from "express";
import multer from "multer";
import { renderNewPostForm, getAllPosts, createNewPost, showPost, renderEditFormPost, updatePost, deletePost, likeDislikePost, getPostsByUser, getPostsByTag } from "../controllers/posts.js";
import { catchAsyncError, checkPostExists, fetchDataForSidebar, validatePost } from "../../utils/middlewares.js";
import { isLoggedIn, isAuthor } from "../../utils/middlewares.js";

export const router = express.Router();

// 
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/")
    .get(fetchDataForSidebar, catchAsyncError(getAllPosts))
    .post(isLoggedIn, upload.single("image"), validatePost, catchAsyncError(createNewPost));
router.route("/new")
    .get(isLoggedIn, catchAsyncError(renderNewPostForm));
router.route("/:id/edit")
    .get(isLoggedIn, checkPostExists, isAuthor, catchAsyncError(renderEditFormPost));
router.route("/:id")
    .get(fetchDataForSidebar, checkPostExists, catchAsyncError(showPost))
    .put(isLoggedIn, checkPostExists, isAuthor, upload.single("image"), validatePost, catchAsyncError(updatePost))
    .patch(isLoggedIn, catchAsyncError(likeDislikePost))
    .delete(isLoggedIn, checkPostExists, isAuthor, catchAsyncError(deletePost));
router.route("/user/:user_id")
    .get(fetchDataForSidebar, catchAsyncError(getPostsByUser));
router.route("/tag/:tag_id")
    .get(fetchDataForSidebar, catchAsyncError(getPostsByTag));
