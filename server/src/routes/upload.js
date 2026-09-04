const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

// Initialize GridFS storage configuration
const storage = new GridFsStorage({
  url: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/techcommerce",
  file: (req, file) => {
    return {
      bucketName: "photos", // Will store in photos.files & photos.chunks collections
      filename: `img-${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) callback(null, true);
    else callback(new Error("Only image files are allowed"));
  },
});

// POST /api/upload - Stores images in MongoDB via GridFS
router.post("/", protect, admin, upload.array("images", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const host = `${req.protocol}://${req.get("host")}`;
  const urls = req.files.map((file) => `${host}/api/upload/file/${file.filename}`);

  res.json({ urls });
});

// GET /api/upload/file/:filename - Serves image binary from MongoDB
router.get("/file/:filename", async (req, res) => {
  const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "photos",
  });

  try {
    const files = await gfs.find({ filename: req.params.filename }).limit(1).toArray();
    if (!files.length) return res.status(404).json({ message: "Image not found" });
    res.type(files[0].contentType || "application/octet-stream");
    const downloadStream = gfs.openDownloadStreamByName(req.params.filename);
    downloadStream.on("error", () => {
      if (!res.headersSent) res.status(404).json({ message: "Image not found" });
      else res.end();
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(404).json({ message: "Image not found" });
  }
});

module.exports = router;
