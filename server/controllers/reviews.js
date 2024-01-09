import { Post } from "../models/posts.js";
import { Review } from "../models/reviews.js";

export const createNewReview = async (req, res) => {
    const { id } = req.params;

    const review = new Review(req.body.review);
    const post = await Post.findById(id);

    // -- Check post existance.

    review.author = req.user._id;
    post.reviews.push(review._id);
    await review.save();
    await post.save();

    req.flash("success", "Review was added successfully.");
    res.redirect(`/posts/${id}`);
};

export const deleteReview = async (req, res) => {
    const { id, review_id } = req.params;

    await Post.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
    await Review.findByIdAndDelete(review_id);

    // -- Check Post/Review existance.

    req.flash("success", "Review was deleted successfully.");
    res.redirect(`/posts/${id}`);
};