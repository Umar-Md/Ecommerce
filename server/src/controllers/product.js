const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Resolve manually entered brands and the two supported category choices on save.
const resolveReferences = async (body, data) => {
  if (["footwear", "clothes"].includes(body.category)) {
    const category = await Category.findOneAndUpdate(
      { slug: body.category },
      { $setOnInsert: { slug: body.category, name: body.category === "footwear" ? "Footwear" : "Clothes" } },
      { upsert: true, new: true, runValidators: true },
    );
    data.category = category._id;
  }
  if (typeof body.brandName === "string" && body.brandName.trim()) {
    const name = body.brandName.trim();
    const slug = slugify(name) || `brand-${Buffer.from(name).toString("hex")}`;
    const brand = await Brand.findOneAndUpdate(
      { slug }, { $setOnInsert: { name, slug } },
      { upsert: true, new: true, runValidators: true },
    );
    data.brand = brand._id;
  }
};

const asArray = (value) =>
  Array.isArray(value)
    ? value.map((v) => (typeof v === "string" ? v.trim() : v)).filter(Boolean)
    : String(value || "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

const sanitizeProduct = (body) => {
  const name = String(body.name ?? body.title ?? "").trim();

  // FIX: Flatten images to simple strings to match images: [String]
  const images = asArray(body.images).map((image) =>
    typeof image === "object" && image?.url ? String(image.url).trim() : String(image).trim()
  );

  const variants = Array.isArray(body.variants)
    ? body.variants.map((v) => ({
        name: String(v.name).trim(),
        values: asArray(v.values),
      }))
    : [
        { name: "Size", values: asArray(body.sizes) },
        { name: "Color", values: asArray(body.colors) },
      ].filter((v) => v.values.length);

  const price = Number(body.price);
  const originalPrice =
    body.originalPrice === "" || body.originalPrice == null
      ? undefined
      : Number(body.originalPrice);

  return {
    name,
    slug: slugify(body.slug || name),
    description: String(body.description || "").trim(),
    price,
    originalPrice,
    discount:
      originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0,
    stock: Number(body.stock),
    category: body.category || undefined,
    brand: body.brand || undefined,
    images,
    variants,
    featured: body.featured === true || body.featured === "true",
    active:
      body.active === undefined
        ? true
        : body.active === true || body.active === "true",
    tags: asArray(body.tags),
    sku: body.sku ? String(body.sku).trim().toUpperCase() : undefined,
  };
};

exports.list = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      discount,
      sort = "featured",
      page = 1,
      limit = 12,
    } = req.query;
    const q = { active: true };

    if (search)
      q.$or = ["name", "description", "tags"].map((field) => ({
        [field]: new RegExp(search, "i"),
      }));

    if (["clothes", "footwear"].includes(String(category).toLowerCase())) {
      const aliases = String(category).toLowerCase() === "clothes"
        ? ["clothes", "clothing", "fashion"] : ["footwear", "shoes"];
      const categories = await Category.find({ $or: [
        { slug: { $in: aliases } },
        { name: { $in: aliases.map((name) => new RegExp(`^${name}$`, "i")) } },
      ] }).select("_id");
      q.category = { $in: categories.map((item) => item._id) };
    } else if (category) {
      const categoryDoc = mongoose.isValidObjectId(category)
        ? await Category.findById(category)
        : await Category.findOne({
            $or: [
              { slug: String(category).toLowerCase() },
              {
                name: new RegExp(
                  `^${String(category).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                  "i"
                ),
              },
            ],
          });
      if (!categoryDoc)
        return res.json({ products: [], total: 0, pages: 0, page: 1 });
      q.category = categoryDoc._id;
    }

    if (minPrice || maxPrice)
      q.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };

    if (rating) q.rating = { $gte: Number(rating) };
    if (discount === "true") q.$expr = { $gt: ["$originalPrice", "$price"] };

    const sorts = {
      featured: "-featured -createdAt",
      newest: "-createdAt",
      price_asc: "price",
      price_desc: "-price",
      rating: "-rating",
    };

    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 12));
    const safePage = Math.max(1, Number(page) || 1);

    const [products, total] = await Promise.all([
      Product.find(q)
        .populate("category brand")
        .sort(sorts[sort] || sorts.featured)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      Product.countDocuments(q),
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / safeLimit),
      page: safePage,
    });
  } catch (error) {
    next(error);
  }
};

exports.get = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid product ID" });

    const product = await Product.findOne({
      _id: req.params.id,
      active: true,
    }).populate("category brand");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = sanitizeProduct(req.body);
    await resolveReferences(req.body, data);

    if (
      !mongoose.isValidObjectId(data.category) ||
      !mongoose.isValidObjectId(data.brand)
    )
      return res
        .status(422)
        .json({ message: "Valid category and brand are required" });

    const [category, brand] = await Promise.all([
      Category.exists({ _id: data.category }),
      Brand.exists({ _id: data.brand }),
    ]);

    if (!category || !brand)
      return res
        .status(422)
        .json({ message: "Category or brand does not exist" });

    // Handle duplicate slug creation
    const slugExists = await Product.exists({ slug: data.slug });
    if (slugExists) data.slug = `${data.slug}-${Date.now()}`;

    res.status(201).json(await Product.create(data));
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid product ID" });

    const data = sanitizeProduct(req.body);
    await resolveReferences(req.body, data);

    if (
      !mongoose.isValidObjectId(data.category) ||
      !mongoose.isValidObjectId(data.brand)
    )
      return res
        .status(422)
        .json({ message: "Valid category and brand are required" });

    const [category, brand] = await Promise.all([
      Category.exists({ _id: data.category }),
      Brand.exists({ _id: data.brand }),
    ]);

    if (!category || !brand)
      return res
        .status(422)
        .json({ message: "Category or brand does not exist" });

    // Prevent slug conflicts on existing products
    const slugOwner = await Product.findOne({ slug: data.slug });
    if (slugOwner && slugOwner._id.toString() !== req.params.id) {
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid product ID" });

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};