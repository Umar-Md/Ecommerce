const r = require("express").Router();
const { protect, admin } = require("../middleware/auth");
const c = require("../controllers/admin");
r.use(protect, admin);
r.get("/dashboard", c.dashboard);
r.get("/customers", c.customers);
r.get("/products", c.products);
module.exports = r;
