const mongoose = require('mongoose');
const { normalizePhone } = require('../utils/phone');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  // Optional for existing accounts and seeded admins; registration requires it.
  phone: { type: String, set: (value) => value == null ? undefined : normalizePhone(value) || value,
    validate: { validator: (value) => value == null || /^[6-9]\d{9}$/.test(value), message: 'Enter a valid 10-digit Indian mobile number' } },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  avatar: String,
}, { timestamps: true });
schema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });
module.exports = mongoose.model('User', schema);
