const test = require("node:test");
const assert = require("node:assert/strict");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");
const controller = require("../src/controllers/order");
const id = "507f1f77bcf86cd799439011";
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } });

test("Next action advances each fulfillment status and restores stock only on cancellation", async (t) => {
  for (const [from, to] of [["PENDING", "PROCESSING"], ["PROCESSING", "SHIPPED"], ["SHIPPED", "DELIVERED"], ["PENDING", "CANCELLED"], ["PROCESSING", "CANCELLED"]]) {
    await t.test(`${from} to ${to}`, async (t) => {
      t.mock.method(Order, "findById", async () => ({ _id: id, status: from, items: [{ product: id, quantity: 2 }] }));
      t.mock.method(Order, "findOneAndUpdate", async (query, update) => {
        assert.equal(query.status, from);
        assert.equal(update.$set.status, to);
        return { _id: id, status: to };
      });
      const stock = t.mock.method(Product, "updateOne", async (query, update) => {
        assert.equal(update.$inc.stock, 2);
      });
      const res = response();
      await controller.updateStatus({ params: { id }, body: { status: to } }, res, (error) => { throw error; });
      assert.equal(res.code, 200);
      assert.equal(res.data.status, to);
      assert.equal(stock.mock.callCount(), to === "CANCELLED" ? 1 : 0);
    });
  }
});

test("Next action rejects terminal, backward, and repeated transitions", async (t) => {
  for (const [from, to] of [["DELIVERED", "PROCESSING"], ["CANCELLED", "PROCESSING"], ["SHIPPED", "PENDING"], ["PROCESSING", "PROCESSING"]]) {
    await t.test(`${from} to ${to}`, async (t) => {
      t.mock.method(Order, "findById", async () => ({ _id: id, status: from }));
      const update = t.mock.method(Order, "findOneAndUpdate", async () => { throw new Error("Should not update"); });
      const res = response();
      await controller.updateStatus({ params: { id }, body: { status: to } }, res, (error) => { throw error; });
      assert.equal(res.code, 409);
      assert.equal(update.mock.callCount(), 0);
    });
  }
});

test("Next action handles concurrent status changes without restoring stock twice", async (t) => {
  t.mock.method(Order, "findById", async () => ({ _id: id, status: "PENDING", items: [] }));
  t.mock.method(Order, "findOneAndUpdate", async () => null);
  const stock = t.mock.method(Product, "updateOne", async () => {});
  const res = response();
  await controller.updateStatus({ params: { id }, body: { status: "CANCELLED" } }, res, (error) => { throw error; });
  assert.equal(res.code, 409);
  assert.equal(stock.mock.callCount(), 0);
});
