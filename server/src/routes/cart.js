const mongoose = require("mongoose");
const router = require("express").Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect, customer } = require("../middleware/auth");
router.use(protect, customer);

const populated = (query) => query.populate("items.product");
router.get("/", async (req, res, next) => {
  try { res.json(await populated(Cart.findOne({ user: req.user._id })) || { user: req.user._id, items: [] }); }
  catch (error) { next(error); }
});
router.put("/:productId", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.productId)) return res.status(400).json({ message: "Invalid product ID" });
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(422).json({ message: "Quantity must be between 1 and 20" });
    const product = await Product.findById(req.params.productId).select("stock");
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (quantity > product.stock) return res.status(409).json({ message: "Requested quantity exceeds available stock" });
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $setOnInsert: { user: req.user._id } },
      { upsert: true, new: true },
    );
    const item = cart.items.find((entry) => String(entry.product) === req.params.productId);
    if (item) item.quantity = quantity; else cart.items.push({ product: req.params.productId, quantity });
    await cart.save();
    res.json(await populated(Cart.findById(cart._id)));
  } catch (error) { next(error); }
});
router.delete("/:productId", async (req, res, next) => {
  try {
    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { product: req.params.productId } } }, { new: true });
    res.json(cart ? await populated(Cart.findById(cart._id)) : { user: req.user._id, items: [] });
  } catch (error) { next(error); }
});
router.delete("/", async (req, res, next) => {
  try { await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } }); res.json({ items: [] }); }
  catch (error) { next(error); }
});
module.exports = router;
