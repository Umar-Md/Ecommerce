require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");
const { notFound, error } = require("./middleware/error");
const app = express();
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/brands", require("./routes/brands"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));
app.use(notFound);
app.use(error);
const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API running on ${port}`)))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
