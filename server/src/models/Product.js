const mongoose = require("mongoose");
const variantSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, values: [{ type: String, trim: true }] }, { _id: false });
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sku: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
  images: [{ url: { type: String, required: true, trim: true }, publicId: String }],
  stock: { type: Number, default: 0, min: 0 },
  variants: [variantSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true, index: true },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });
schema.pre("validate", function(next) {
  if (this.originalPrice != null && this.originalPrice < this.price) this.invalidate("originalPrice", "Original price cannot be lower than retail price");
  this.discount = this.originalPrice > this.price ? Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100) : 0;
  next();
});
schema.index({ name: "text", description: "text", tags: "text" });
module.exports = mongoose.model("Product", schema);
