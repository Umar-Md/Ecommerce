const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");
require("../models/Category");
require("../models/Brand");
exports.dashboard = async (req, res, next) => {
    try {
        const [products, customers, orders, revenue] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments({ role: "customer" }),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { paymentStatus: "PAID" } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
        ]);
        res.json({
            products,
            customers,
            orders,
            revenue: revenue[0]?.total || 0,
            pendingOrders: await Order.countDocuments({
                status: { $in: ["PENDING", "PROCESSING"] },
            }),
        });
    } catch (e) {
        next(e);
    }
};
exports.customers = async (req, res, next) => {
    try {
        res.json({
            customers: await User.find({ role: "customer" })
                .select("-password")
                .sort("-createdAt"),
        });
    } catch (e) {
        next(e);
    }
};
exports.products = async (req, res, next) => {
    try { res.json({ products: await Product.find().populate("category brand").sort("-createdAt").limit(200) }); }
    catch (error) { next(error); }
};
