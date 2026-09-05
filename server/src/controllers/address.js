const mongoose = require("mongoose");
const Address = require("../models/Address");
const limits = { fullName: 100, phone: 30, line1: 300, city: 100, state: 100, postalCode: 20 };

exports.list = async (req, res, next) => {
  try {
    res.json({ addresses: await Address.find({ user: req.user._id }).sort({ createdAt: -1 }) });
  } catch (error) { next(error); }
};

exports.create = async (req, res, next) => {
  try {
    const fields = {};
    for (const [key, max] of Object.entries(limits)) {
      const value = req.body[key];
      if (typeof value !== "string" || !value.trim() || value.trim().length > max)
        return res.status(422).json({ message: `Enter a valid ${key.replace(/([A-Z])/g, " $1").toLowerCase()} (maximum ${max} characters)` });
      fields[key] = value.trim();
    }
    if (req.body.label !== undefined && (typeof req.body.label !== "string" || req.body.label.trim().length > 50))
      return res.status(422).json({ message: "Address label must be at most 50 characters" });
    fields.label = req.body.label?.trim() || "Home";
    const address = await Address.create({ ...fields, user: req.user._id });
    res.status(201).json(address);
  } catch (error) { next(error); }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid address ID" });
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return res.status(404).json({ message: "Address not found" });
    res.json({ message: "Address removed" });
  } catch (error) { next(error); }
};
