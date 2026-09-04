const mongoose = require("mongoose");
const router = require("express").Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const { protect, customer } = require("../middleware/auth");

const refreshRating = async (productId) => {
  const result = await Review.aggregate([{ $match: { product: new mongoose.Types.ObjectId(productId) } }, { $group: { _id: null, rating: { $avg: "$rating" }, count: { $sum: 1 } } }]);
  await Product.updateOne({ _id: productId }, { rating: result[0]?.rating || 0, numReviews: result[0]?.count || 0 });
};
router.get("/:productId", async (req, res, next) => {
  try { res.json(await Review.find({ product: req.params.productId }).populate("user", "name").sort("-createdAt")); }
  catch (error) { next(error); }
});
router.post("/:productId", protect, customer, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId) || !(await Product.exists({ _id: req.params.productId }))) return res.status(404).json({ message: "Product not found" });
    const rating = Number(req.body.rating); const comment = String(req.body.comment || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 3 || comment.length > 1000) return res.status(422).json({ message: "Rating must be 1–5 and comment 3–1000 characters" });
    const review = await Review.create({ product: req.params.productId, user: req.user._id, rating, comment });
    await refreshRating(req.params.productId); res.status(201).json(review);
  } catch (error) { next(error); }
});
router.put("/:reviewId", protect, customer, async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.reviewId, user: req.user._id });
    if (!review) return res.status(404).json({ message: "Review not found" });
    const rating = Number(req.body.rating); const comment = String(req.body.comment || "").trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 3 || comment.length > 1000) return res.status(422).json({ message: "Invalid review" });
    review.rating = rating; review.comment = comment; await review.save(); await refreshRating(review.product); res.json(review);
  } catch (error) { next(error); }
});
router.delete("/:reviewId", protect, async (req, res, next) => {
  try {
    const query = req.user.role === "admin" ? { _id: req.params.reviewId } : { _id: req.params.reviewId, user: req.user._id };
    const review = await Review.findOneAndDelete(query);
    if (!review) return res.status(404).json({ message: "Review not found" });
    await refreshRating(review.product); res.json({ message: "Review deleted" });
  } catch (error) { next(error); }
});
module.exports = router;
