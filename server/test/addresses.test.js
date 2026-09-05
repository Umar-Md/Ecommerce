const test = require("node:test");
const assert = require("node:assert/strict");
const Address = require("../src/models/Address");
const Order = require("../src/models/Order");
const controller = require("../src/controllers/address");
const owner = "507f1f77bcf86cd799439011";
const addressId = "507f1f77bcf86cd799439012";
const body = { label: " Work ", fullName: " Customer ", phone: "1234567890", line1: "Office Road", city: "Delhi", state: "Delhi", postalCode: "110001" };
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } });
const next = (error) => { throw error; };

test("new orders receive distinct IDs before saving", () => {
  const first = new Order();
  const second = new Order();
  assert.match(String(first._id), /^[a-f0-9]{24}$/);
  assert.notEqual(String(first._id), String(second._id));
});

test("save uses authenticated owner, trims fields, and ignores injected fields", async (t) => {
  t.mock.method(Address, "create", async (data) => {
    assert.equal(data.user, owner);
    assert.equal(data.fullName, "Customer");
    assert.equal(data.label, "Work");
    assert.equal(data._id, undefined);
    return { ...data, _id: addressId };
  });
  const res = response();
  await controller.create({ user: { _id: owner }, body: { ...body, user: "another-user", _id: "injected" } }, res, next);
  assert.equal(res.code, 201);
});

test("rejects incomplete, non-string, and oversized addresses before saving", async (t) => {
  const create = t.mock.method(Address, "create", async () => { throw Error("Must not save"); });
  for (const changed of [{ city: " " }, { phone: {} }, { line1: "x".repeat(301) }, { label: "x".repeat(51) }]) {
    const res = response();
    await controller.create({ user: { _id: owner }, body: { ...body, ...changed } }, res, next);
    assert.equal(res.code, 422);
  }
  assert.equal(create.mock.callCount(), 0);
});

test("list retrieves only the authenticated customer's addresses", async (t) => {
  t.mock.method(Address, "find", (query) => {
    assert.deepEqual(query, { user: owner });
    return { sort: async () => [{ _id: addressId }, { _id: "second-address" }] };
  });
  const res = response();
  await controller.list({ user: { _id: owner } }, res, next);
  assert.equal(res.data.addresses.length, 2);
});

test("delete cannot remove another customer's address", async (t) => {
  t.mock.method(Address, "findOneAndDelete", async (query) => {
    assert.deepEqual(query, { _id: addressId, user: owner });
    return null;
  });
  const res = response();
  await controller.remove({ user: { _id: owner }, params: { id: addressId } }, res, next);
  assert.equal(res.code, 404);
});

test("delete validates IDs and removes owned addresses", async (t) => {
  const remove = t.mock.method(Address, "findOneAndDelete", async () => ({ _id: addressId }));
  const invalid = response();
  await controller.remove({ user: { _id: owner }, params: { id: "invalid" } }, invalid, next);
  assert.equal(invalid.code, 400);
  assert.equal(remove.mock.callCount(), 0);
  const res = response();
  await controller.remove({ user: { _id: owner }, params: { id: addressId } }, res, next);
  assert.equal(res.code, 200);
});
