exports.notFound = (req, res) => res.status(404).json({ message: "Route not found" });

exports.error = (error, req, res, next) => {
  let status = error.status || error.statusCode || 500;
  let message = error.message || "Server error";
  if (error.name === "ValidationError") { status = 422; message = Object.values(error.errors).map((e) => e.message).join(", "); }
  if (error.name === "CastError") { status = 400; message = "Invalid identifier"; }
  if (error.code === 11000) { status = 409; message = "A record with that value already exists"; }
  if (status >= 500) {
    console.error(error);
    message = process.env.NODE_ENV === "production" ? "An unexpected server error occurred" : message;
  }
  res.status(status).json({ message });
};
