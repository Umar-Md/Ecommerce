const test = require("node:test");
const assert = require("node:assert/strict");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");
const controller = require("../src/controllers/order");
const id = "507f1f77bcf86cd799439011";
const owner = "507f1f77bcf86cd799439012";
const request = () => ({ params: { id }, user: { _id: owner }, body: { status: "DELIVERED" } });
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } });
const next = (error) => { throw error; };

test("customers cancel only their own pending or processing orders and restore stock", async (t) => {
  for (const status of ["PENDING", "PROCESSING"]) await t.test(status, async (t) => {
    t.mock.method(Order, "findOne", async (query) => {
      assert.deepEqual(query, { _id: id, user: owner });
      return { _id: id, status, items: [{ product: id, quantity: 3 }] };
    });
    t.mock.method(Order, "findOneAndUpdate", async (query, update) => {
      assert.deepEqual(query, { _id: id, user: owner, status });
      assert.equal(update.$set.status, "CANCELLED");
      return { _id: id, status: "CANCELLED" };
    });
    const stock = t.mock.method(Product, "updateOne", async (query, update) => {
      assert.equal(query._id, id);
      assert.equal(update.$inc.stock, 3);
    });
    const res = response();
    await controller.cancel(request(), res, next);
    assert.equal(res.code, 200);
    assert.equal(stock.mock.callCount(), 1);
  });
});

test("customers cannot cancel another customer's order", async (t) => {
  t.mock.method(Order, "findOne", async (query) => { assert.equal(query.user, owner); return null; });
  const update = t.mock.method(Order, "findOneAndUpdate", async () => { throw Error("Must not update"); });
  const res = response();
  await controller.cancel(request(), res, next);
  assert.equal(res.code, 404);
  assert.equal(update.mock.callCount(), 0);
});

test("shipped, delivered and cancelled orders cannot be cancelled", async (t) => {
  for (const status of ["SHIPPED", "DELIVERED", "CANCELLED"]) await t.test(status, async (t) => {
    t.mock.method(Order, "findOne", async () => ({ _id: id, status }));
    const stock = t.mock.method(Product, "updateOne", async () => { throw Error("Must not restore"); });
    const res = response();
    await controller.cancel(request(), res, next);
    assert.equal(res.code, 409);
    assert.equal(stock.mock.callCount(), 0);
  });
});

test("shipment winning a race rejects cancellation without restoring stock", async (t) => {
  t.mock.method(Order, "findOne", async () => ({ _id: id, status: "PROCESSING", items: [{ product: id, quantity: 3 }] }));
  t.mock.method(Order, "findOneAndUpdate", async () => null);
  const stock = t.mock.method(Product, "updateOne", async () => {});
  const res = response();
  await controller.cancel(request(), res, next);
  assert.equal(res.code, 409);
  assert.equal(stock.mock.callCount(), 0);
});

test("COD payment recording requires a delivered unpaid COD order", async (t) => {
  t.mock.method(Order, "findOneAndUpdate", async (query, update) => {
    assert.deepEqual(query, { _id: id, status: "DELIVERED", paymentMethod: "COD", paymentStatus: "PENDING" });
    assert.equal(update.$set.paymentStatus, "PAID");
    return { _id: id, paymentStatus: "PAID" };
  });
  const res = response();
  await controller.markPaid(request(), res, next);
  assert.equal(res.data.paymentStatus, "PAID");
});

test("COD payment rejects repeated or ineligible payment updates", async (t) => {
  t.mock.method(Order, "findOneAndUpdate", async () => null);
  const res = response();
  await controller.markPaid(request(), res, next);
  assert.equal(res.code, 409);
});
