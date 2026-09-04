const r = require("express").Router();
const c = require("../controllers/wishlist");
const { protect, customer } = require("../middleware/auth");
r.use(protect, customer);
r.get("/", c.get);
r.post("/", c.add);
r.delete("/:productId", c.remove);
module.exports = r;
