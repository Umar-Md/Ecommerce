const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateTotals, canTransition } = require("../src/utils/commerce");
test("calculates server totals", () => assert.deepEqual(calculateTotals([{ price: 500, quantity: 2 }]), { subtotal: 1000, shipping: 99, tax: 180, total: 1279 }));
test("makes shipping free at threshold", () => assert.deepEqual(calculateTotals([{ price: 1999, quantity: 1 }]), { subtotal: 1999, shipping: 0, tax: 360, total: 2359 }));
test("allows only forward transitions", () => { assert.equal(canTransition("PENDING", "PROCESSING"), true); assert.equal(canTransition("SHIPPED", "DELIVERED"), true); assert.equal(canTransition("DELIVERED", "PENDING"), false); });
test("allows cancellation only before shipment", () => { assert.equal(canTransition("PENDING", "CANCELLED"), true); assert.equal(canTransition("PROCESSING", "CANCELLED"), true); assert.equal(canTransition("SHIPPED", "CANCELLED"), false); });
