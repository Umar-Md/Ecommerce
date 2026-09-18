const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../src/models/Product");
const { list } = require("../src/controllers/product");

const response = () => ({ status(code) { this.code = code; return this; }, json(data) { this.data = data; } });
const next = (error) => { throw error; };

test("catalog treats search punctuation literally and combines shopping filters", async (t) => {
  let captured;
  const chain = {
    populate() { return this; }, sort() { return this; },
    skip(value) { assert.equal(value, 0); return this; },
    limit(value) { assert.equal(value, 12); return Promise.resolve([]); },
  };
  t.mock.method(Product, "find", (query) => { captured = query; return chain; });
  t.mock.method(Product, "countDocuments", async () => 0);
  const res = response();
  await list({ query: { search: "shoe [.*", inStock: "true", brand: "507f1f77bcf86cd799439013", minPrice: "0", maxPrice: "500", rating: "4", discount: "true" } }, res, next);
  assert.equal(captured.$or[0].name.test("shoe [.*"), true);
  assert.equal(captured.$or[0].name.test("shoe anything"), false);
  assert.deepEqual(captured.stock, { $gt: 0 });
  assert.deepEqual(captured.price, { $gte: 0, $lte: 500 });
  assert.deepEqual(captured.rating, { $gte: 4 });
  assert.equal(captured.brand, "507f1f77bcf86cd799439013");
  assert.deepEqual(captured.$expr, { $gt: ["$originalPrice", "$price"] });
  assert.equal(res.data.total, 0);
});

test("catalog rejects invalid filters before querying products", async (t) => {
  t.mock.method(Product, "find", () => { throw Error("Must not query products"); });
  for (const query of [{ minPrice: "-1" }, { maxPrice: "Infinity" }, { rating: "6" }, { minPrice: "50", maxPrice: "20" }, { search: ["shoe"] }, { search: "a".repeat(201) }, { brand: "invalid" }]) {
    const res = response();
    await list({ query }, res, next);
    assert.equal(res.code, 400);
  }
});

test("catalog normalizes non-finite pagination and fractional limits", async (t) => {
  for (const [query, expectedLimit] of [[{ page: "Infinity", limit: "Infinity" }, 12], [{ page: "1.5", limit: "2.8" }, 2]]) {
    const chain = { populate() { return this; }, sort() { return this; }, skip(value) { assert.equal(value, 0); return this; }, limit(value) { assert.equal(value, expectedLimit); return Promise.resolve([]); } };
    t.mock.method(Product, "find", () => chain);
    t.mock.method(Product, "countDocuments", async () => 0);
    const res = response();
    await list({ query }, res, next);
    assert.equal(res.data.page, 1);
  }
});
