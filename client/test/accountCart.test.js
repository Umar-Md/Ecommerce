import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { act, create } from "react-test-renderer";
import useAccountCart from "../src/context/useAccountCart.js";

test("React cart switches accounts without leaking items and ignores old checkout callbacks", () => {
  const entries = new Map();
  globalThis.localStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
  };
  let cart;
  let update;
  const renders = [];
  function Customer({ user }) {
    [cart, update] = useAccountCart(user);
    renders.push({ owner: user?.id, cart });
    return null;
  }
  const a = { id: "a" };
  const b = { id: "b" };
  const items = [{ product: { _id: "product" }, quantity: 2 }];
  let root;
  act(() => { root = create(React.createElement(Customer, { user: a })); });
  act(() => update(items));
  const oldCheckoutUpdate = update;
  act(() => root.update(React.createElement(Customer, { user: b })));
  assert.deepEqual(cart, []);
  assert.ok(renders.filter((render) => render.owner === "b").every((render) => render.cart.length === 0));
  const bItems = [{ product: { _id: "other-product" }, quantity: 1 }];
  act(() => update(bItems));
  act(() => oldCheckoutUpdate([]));
  assert.deepEqual(cart, bItems);
  act(() => root.update(React.createElement(Customer, { user: null })));
  assert.deepEqual(cart, []);
  act(() => root.update(React.createElement(Customer, { user: a })));
  assert.deepEqual(cart, items);
  act(() => root.unmount());
  act(() => { root = create(React.createElement(Customer, { user: b })); });
  assert.deepEqual(cart, bItems);
  act(() => root.unmount());
  delete globalThis.localStorage;
});
