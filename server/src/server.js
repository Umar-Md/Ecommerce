require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");
const { notFound, error } = require("./middleware/error");

const app = express();

// 1. Security Headers (Configured for cross-origin image loading)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 2. CORS Setup
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173")
      .split(",")
      .map((origin) => origin.trim()),
    credentials: true,
  })
);

// 3. Body Parsers (MUST be declared BEFORE routes so large Base64 requests succeed)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 4. Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// 5. Health Check Route
app.get("/api/health", (req, res) => res.json({ ok: true }));

// 6. Application Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/brands", require("./routes/brands"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/addresses", require("./routes/addresses"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/upload", require("./routes/upload"));

// 7. Error Handling Middleware (MUST be declared AFTER all routes)
app.use(notFound);
app.use(error);

// 8. Database Connection & Server Initialization
const port = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(port, () => console.log(`API running on port ${port}`)))
  .catch((e) => {
    console.error("Database connection failure:", e);
    process.exit(1);
  });
