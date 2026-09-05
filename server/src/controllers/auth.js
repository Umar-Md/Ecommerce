const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { normalizePhone } = require("../utils/phone");

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
const sign = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = normalizePhone(req.body.phone);
    if (name.length < 2 || name.length > 80) return res.status(422).json({ message: "Name must be between 2 and 80 characters" });
    if (!emailPattern.test(email)) return res.status(422).json({ message: "Enter a valid email address" });
    if (!phone) return res.status(422).json({ message: "Enter a valid 10-digit Indian mobile number" });
    if (password.length < 8 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
      return res.status(422).json({ message: "Password must be 8–128 characters and include a letter and number" });
    if (await User.exists({ email })) return res.status(409).json({ message: "Email already registered" });
    if (await User.exists({ phone })) return res.status(409).json({ message: "Mobile number already registered" });
    const user = await User.create({ name, email, phone, password: await bcrypt.hash(password, 12), role: "customer" });
    res.status(201).json({ user: publicUser(user), token: sign(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: error.keyPattern?.phone ? "Mobile number already registered" : "Email or mobile number already registered" });
    next(error);
  }
};
exports.login = async (req, res, next) => {
  try {
    const identifier = String(req.body.identifier || req.body.email || req.body.phone || "").trim();
    const password = String(req.body.password || "");
    const phone = normalizePhone(identifier);
    if (!emailPattern.test(identifier) && !phone)
      return res.status(401).json({ message: "Invalid email/mobile number or password" });
    const user = await User.findOne(emailPattern.test(identifier) ? { email: identifier.toLowerCase() } : { phone });
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email/mobile number or password" });
    res.json({ user: publicUser(user), token: sign(user) });
  } catch (error) { next(error); }
};
exports.me = (req, res) => res.json({ user: publicUser(req.user) });
exports.logout = (req, res) => res.json({ message: "Logged out" });
