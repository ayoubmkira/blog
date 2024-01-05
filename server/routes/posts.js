import express from "express";
import multer from "multer";
import { renderNewPostForm, getAllPosts, createNewPost, showPost, renderEditFormPost, updatePost, deletePost } from "../controllers/posts.js";
import { catchAsyncError, validatePost } from "../../utils/middlewares.js";

export const router = express.Router();

// 
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route("/")
    .get(catchAsyncError(getAllPosts))
    .post(upload.single("image"), validatePost, catchAsyncError(createNewPost));
router.route("/new")
    .get(renderNewPostForm);
router.route("/:id/edit")
    .get(catchAsyncError(renderEditFormPost));
router.route("/:id")
    .get(catchAsyncError(showPost))
    .put(upload.single("image"), validatePost, catchAsyncError(updatePost))
    .delete(catchAsyncError(deletePost));