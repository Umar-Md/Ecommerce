const r = require("express").Router();
const c = require("../controllers/product");
const { protect, admin } = require("../middleware/auth");
r.get("/", c.list);
r.get("/:id", c.get);
r.post("/", protect, admin, c.create);
r.put("/:id", protect, admin, c.update);
r.delete("/:id", protect, admin, c.remove);
module.exports = r;
