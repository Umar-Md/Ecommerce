const router = require("express").Router();
const Brand = require("../models/Brand");
const { protect, admin } = require("../middleware/auth");
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
router.get("/", async (req, res, next) => { try { res.json(await Brand.find().sort("name")); } catch (error) { next(error); } });
router.post("/", protect, admin, async (req, res, next) => {
  try { const name = String(req.body.name || "").trim(); if (!name) return res.status(422).json({ message: "Brand name is required" }); res.status(201).json(await Brand.create({ name, slug: slugify(name), logo: req.body.logo })); }
  catch (error) { next(error); }
});
module.exports = router;
