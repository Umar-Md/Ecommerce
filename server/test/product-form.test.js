const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../src/models/Product");
const Category = require("../src/models/Category");
const Brand = require("../src/models/Brand");
const controller = require("../src/controllers/product");
const productId = "507f1f77bcf86cd799439011";
const categoryId = "507f1f77bcf86cd799439012";
const brandId = "507f1f77bcf86cd799439013";

for (const action of ["create", "update"]) {
  test(`${action} saves a typed brand, supported category, and selected sizes`, async (t) => {
    t.mock.method(Category, "findOneAndUpdate", async (query, update) => {
      assert.equal(query.slug, "footwear");
      assert.equal(update.$setOnInsert.name, "Footwear");
      return { _id: categoryId };
    });
    t.mock.method(Brand, "findOneAndUpdate", async (query, update) => {
      assert.equal(query.slug, "new-brand");
      assert.equal(update.$setOnInsert.name, "New Brand");
      return { _id: brandId };
    });
    t.mock.method(Category, "exists", async () => true);
    t.mock.method(Brand, "exists", async () => true);
    t.mock.method(Product, "exists", async () => false);
    t.mock.method(Product, "findOne", async () => null);
    const verify = (data) => {
      assert.equal(data.brand, brandId);
      assert.equal(data.category, categoryId);
      assert.deepEqual(data.variants, [{ name: "Size", values: ["7", "8"] }]);
      return { _id: productId, ...data };
    };
    t.mock.method(Product, "create", async (data) => verify(data));
    t.mock.method(Product, "findByIdAndUpdate", async (id, data) => verify(data));
    const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
    await controller[action]({ params: { id: productId }, body: {
      name: "Trainers", description: "Everyday trainers", category: "footwear", brandName: "  New Brand  ",
      sizes: "7, 8", price: 999, stock: 10, images: ["https://example.com/shoe.jpg"],
    } }, res, (error) => { throw error; });
    assert.equal(res.data._id, productId);
  });
}
