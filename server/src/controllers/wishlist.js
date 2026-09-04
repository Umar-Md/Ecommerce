const Wishlist = require("../models/Wishlist");
exports.get = async (req, res, next) => {
  try {
    let w = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!w) w = await Wishlist.create({ user: req.user._id, products: [] });
    res.json({ products: w.products });
  } catch (e) {
    next(e);
  }
};
exports.add = async (req, res, next) => {
  try {
    const w = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: req.body.productId } },
      { upsert: true, new: true },
    ).populate("products");
    res.json({ products: w.products });
  } catch (e) {
    next(e);
  }
};
exports.remove = async (req, res, next) => {
  try {
    const w = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: req.params.productId } },
      { new: true },
    ).populate("products");
    res.json({ products: w?.products || [] });
  } catch (e) {
    next(e);
  }
};
