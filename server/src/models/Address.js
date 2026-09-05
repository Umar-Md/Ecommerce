const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  label: { type: String, trim: true, maxlength: 50, default: "Home" },
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  line1: { type: String, required: true, trim: true, maxlength: 300 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  state: { type: String, required: true, trim: true, maxlength: 100 },
  postalCode: { type: String, required: true, trim: true, maxlength: 20 },
}, { timestamps: true });

module.exports = mongoose.model("Address", schema);
