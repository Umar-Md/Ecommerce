import test from "node:test";
import assert from "node:assert/strict";
import { cartOwner, readCart, writeCart } from "../src/utils/cartStorage.js";

const storage = () => {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
};
const items = [{ product: { _id: "product-1", price: 100, stock: 10 }, quantity: 2 }];

test("switching accounts and logging back in keeps carts isolated", () => {
  const store = storage();
  writeCart(store, cartOwner({ id: "customer-a" }), items);
  assert.deepEqual(readCart(store, cartOwner({ id: "customer-b" })), []);
  assert.deepEqual(readCart(store, cartOwner(null)), []);
  writeCart(store, "customer-b", [{ ...items[0], quantity: 1 }]);
  assert.deepEqual(readCart(store, "customer-a"), items);
  writeCart(store, "customer-b", []);
  assert.deepEqual(readCart(store, "customer-a"), items);
  assert.deepEqual(readCart(store, "customer-b"), []);
});

test("guest and legacy shared carts are never assigned to a new account", () => {
  const store = storage();
  store.setItem("cart", JSON.stringify(items));
  assert.deepEqual(readCart(store, "guest"), []);
  assert.deepEqual(readCart(store, "new-account"), []);
  writeCart(store, "guest", items);
  assert.deepEqual(readCart(store, "new-account"), []);
  assert.deepEqual(readCart(store, "guest"), items);
});

test("malformed stored carts cannot break the cart view", () => {
  const store = storage();
  for (const value of ["bad json", "null", "{}", '[null, {"quantity": 2}]']) {
    store.setItem("cart:v2:customer-a", value);
    assert.deepEqual(readCart(store, "customer-a"), []);
  }
  assert.equal(cartOwner({ _id: "customer-a" }), "customer-a");
});
