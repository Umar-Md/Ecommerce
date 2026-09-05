require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");
const User = require("./models/User");
const Category = require("./models/Category");
const Brand = require("./models/Brand");
const Product = require("./models/Product");
(async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
  ]);
  const admin = await User.create({
    name: "TechCommerce Admin",
    email: "admin@example.com",
    password: await bcrypt.hash("Admin@12345", 12),
    role: "admin",
  });
  const cats = await Category.insertMany(
    ["Clothes", "Footwear"].map((n) => ({
      name: n,
      slug: n.toLowerCase(),
    })),
  );
  const brands = await Brand.insertMany(
    ["Aster", "Noma", "Kanso", "Luma"].map((n) => ({
      name: n,
      slug: n.toLowerCase(),
    })),
  );
  const names = [
    "Everyday Overshirt",
    "Everyday Trainers",
    "Cotton T-Shirt",
    "Leather Loafers",
    "Essential Sneakers",
    "Linen Relaxed Shirt",
    "Relaxed Jeans",
    "Running Shoes",
  ];
  const products = names.map((name, i) => ({
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
    description:
      "A thoughtfully designed everyday product combining premium materials, practical details and timeless style.",
    price: 799 + i * 650,
    originalPrice: 1199 + i * 800,
    discount: 20,
    category: cats[/Sneakers|Trainers|Loafers|Shoes/.test(name) ? 1 : 0]._id,
    brand: brands[i % brands.length]._id,
    images: [
      {
        url: `https://images.unsplash.com/photo-${["1521572163474-6864f9cf17ab", "1542291026-7eec264c27ff", "1521572163474-6864f9cf17ab", "1542291026-7eec264c27ff", "1542291026-7eec264c27ff", "1564257577054-1f5f7f7f7f0", "1521572163474-6864f9cf17ab", "1542291026-7eec264c27ff"][i]}?auto=format&fit=crop&w=900&q=80`,
      },
    ],
    stock: 50 + i * 10,
    featured: i < 4,
    rating: 4.4 + (i % 5) / 10,
    numReviews: 20 + i * 13,
  }));
  await Product.insertMany(products);
  console.log("Seed complete");
  process.exit();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
