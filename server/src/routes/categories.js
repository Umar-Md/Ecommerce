const router = require("express").Router();
const Category = require("../models/Category");
const { protect, admin } = require("../middleware/auth");
const slugify = (value) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
router.get("/", async (req, res, next) => { try { res.json(await Category.find().sort("name")); } catch (error) { next(error); } });
router.post("/", protect, admin, async (req, res, next) => {
  try { const name = String(req.body.name || "").trim(); if (!name) return res.status(422).json({ message: "Category name is required" }); res.status(201).json(await Category.create({ name, slug: slugify(name), image: req.body.image, description: req.body.description })); }
  catch (error) { next(error); }
});
router.put("/:id", protect, admin, async (req, res, next) => {
  try { const name = String(req.body.name || "").trim(); if (!name) return res.status(422).json({ message: "Category name is required" }); const category = await Category.findByIdAndUpdate(req.params.id, { name, slug: slugify(name), image: req.body.image, description: req.body.description }, { new: true, runValidators: true }); if (!category) return res.status(404).json({ message: "Category not found" }); res.json(category); }
  catch (error) { next(error); }
});
router.delete("/:id", protect, admin, async (req, res, next) => {
  try { const category = await Category.findByIdAndDelete(req.params.id); if (!category) return res.status(404).json({ message: "Category not found" }); res.json({ message: "Category deleted" }); }
  catch (error) { next(error); }
});
module.exports = router;
