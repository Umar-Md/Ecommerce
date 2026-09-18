const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
require("../models/User");
const { calculateTotals, canTransition } = require("../utils/commerce");

const restoreStock = (items) => Promise.all(items.map((item) =>
  Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }),
));

exports.create = async (req, res, next) => {
  const reservations = [];
  let orderSaved = false;
  try {
    const { items, shippingAddress, paymentMethod = "COD" } = req.body;
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: "Cart is empty" });
    if (paymentMethod !== "COD") return res.status(400).json({ message: "Online payment is not available yet. Please use Cash on Delivery." });

    const addressLimits = { fullName: 100, phone: 30, line1: 300, city: 100, state: 100, postalCode: 20 };
    const addressFields = Object.keys(addressLimits);
    if (!shippingAddress || addressFields.some((field) => typeof shippingAddress[field] !== "string" || !shippingAddress[field].trim() || shippingAddress[field].trim().length > addressLimits[field]))
      return res.status(400).json({ message: "A complete shipping address is required" });

    const combined = new Map();
    for (const item of items) {
      if (!item || typeof item.product !== "string" || !mongoose.isValidObjectId(item.product)) return res.status(400).json({ message: "Cart contains an invalid product" });
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
        return res.status(400).json({ message: "Item quantity must be between 1 and 20" });
      const id = String(item.product);
      combined.set(id, (combined.get(id) || 0) + quantity);
      if (combined.get(id) > 20) return res.status(400).json({ message: "Maximum quantity per product is 20" });
    }

    const products = await Product.find({ _id: { $in: [...combined.keys()] }, active: true });
    if (products.length !== combined.size) return res.status(409).json({ message: "One or more products are unavailable" });

    const orderItems = [];
    for (const product of products) {
      const quantity = combined.get(String(product._id));
      const reserved = await Product.findOneAndUpdate(
        { _id: product._id, active: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true },
      );
      if (!reserved) {
        const error = new Error(`Insufficient stock for ${product.name}`);
        error.status = 409;
        throw error;
      }
      const item = { product: product._id, name: product.name, price: product.price, quantity };
      reservations.push(item);
      orderItems.push(item);
    }

    const totals = calculateTotals(orderItems);
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: Object.fromEntries(addressFields.map((field) => [field, String(shippingAddress[field]).trim()])),
        ...totals,
        paymentMethod: "COD",
        status: "PENDING",
      });
      orderSaved = true;
      res.status(201).json(order);
  } catch (error) {
    if (!orderSaved && reservations.length) {
      try { await restoreStock(reservations); }
      catch (restoreError) { return next(restoreError); }
    }
    next(error);
  }
};

exports.mine = async (req, res, next) => {
  try { res.json({ orders: await Order.find({ user: req.user._id }).sort("-createdAt") }); }
  catch (error) { next(error); }
};

exports.get = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID" });
    const query = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
    const order = await Order.findOne(query).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) { next(error); }
};

exports.adminList = async (req, res, next) => {
  try { res.json({ orders: await Order.find().populate("user", "name email").sort("-createdAt").limit(100) }); }
  catch (error) { next(error); }
};

const changeStatus = async (req, res, next, customerCancel = false) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID" });
    const nextStatus = customerCancel ? "CANCELLED" : String(req.body.status || "").toUpperCase();
    const current = customerCancel
      ? await Order.findOne({ _id: req.params.id, user: req.user._id })
      : await Order.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Order not found" });
    if (!canTransition(current.status, nextStatus))
      return res.status(409).json({ message: customerCancel ? "Only orders that have not shipped can be cancelled" : `Order cannot move from ${current.status} to ${nextStatus}` });

    const updated = await Order.findOneAndUpdate(
      { _id: current._id, status: current.status, ...(customerCancel ? { user: req.user._id } : {}) },
      { $set: { status: nextStatus } },
      { new: true, runValidators: true },
    );
    if (!updated) return res.status(409).json({ message: "Order status changed; refresh and try again" });

    if (nextStatus === "CANCELLED") {
      try {
        await restoreStock(current.items);
      } catch (error) {
        await Order.updateOne({ _id: current._id, status: "CANCELLED" }, { $set: { status: current.status } });
        throw error;
      }
    }
    res.json(updated);
  } catch (error) { next(error); }
};

exports.updateStatus = (req, res, next) => changeStatus(req, res, next);
exports.cancel = (req, res, next) => changeStatus(req, res, next, true);

exports.markPaid = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid order ID" });
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: "DELIVERED", paymentMethod: "COD", paymentStatus: "PENDING" },
      { $set: { paymentStatus: "PAID" } },
      { new: true, runValidators: true },
    );
    if (!order) return res.status(409).json({ message: "Only delivered COD orders with pending payment can be marked paid" });
    res.json(order);
  } catch (error) { next(error); }
};
