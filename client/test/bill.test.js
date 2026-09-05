import test from "node:test";
import assert from "node:assert/strict";
import { createBill, billFilename, billDate } from "../src/utils/downloadBill.js";

const order = {
  _id: "507f1f77bcf86cd799439011", createdAt: "2026-09-05T20:45:12Z",
  shippingAddress: { fullName: "Aarav Sharma", line1: "12 Park Road", city: "Mumbai", state: "Maharashtra", postalCode: "400001", phone: "9876543210" },
  items: [{ name: "Everyday Overshirt", price: 799, quantity: 2 }, { name: "Everyday Trainers", price: 1449, quantity: 1 }],
  subtotal: 3047, shipping: 0, tax: 548, total: 3595,
  paymentMethod: "COD", paymentStatus: "PENDING", status: "PENDING",
};

test("bill filename includes store, full order ID and order timestamp in IST", () => {
  assert.equal(billFilename(order), "TechCommerce_Bill_507f1f77bcf86cd799439011_2026-09-06_02-15-12-IST.pdf");
  assert.equal(billDate(order.createdAt).display, "06/09/2026  02:15:12 IST");
  assert.equal(billDate(null).display, "Not available");
  assert.ok(!/[\\/:*?"<>|]/.test(billFilename({ ...order, _id: "bad/id:1" })));
});

test("branded PDF includes customer, payment details, totals and page footer", () => {
  const doc = createBill(order);
  const pdf = doc.output();
  assert.equal(doc.getNumberOfPages(), 1);
  for (const value of ["%PDF-", "TechCommerce", order._id, "02:15:12 IST", "Aarav Sharma", "Everyday Overshirt", "3,595.00", "Payment due on delivery", "Page 1 of 1"]) assert.ok(pdf.includes(value), value);
});

test("long bills paginate and retain final items and totals", () => {
  const doc = createBill({ ...order, items: Array.from({ length: 100 }, (_, index) => ({ name: `Product ${index + 1} ${"Long description ".repeat(12)}`, quantity: 1, price: 10 })), subtotal: 1000, tax: 180, total: 1180 });
  const pdf = doc.output();
  assert.ok(doc.getNumberOfPages() > 1);
  assert.ok(pdf.includes("Product 100"));
  assert.ok(pdf.includes("1,180.00"));
  assert.ok(pdf.includes(`Page ${doc.getNumberOfPages()} of ${doc.getNumberOfPages()}`));
});

test("cancelled bills never request COD payment", () => {
  const pdf = createBill({ ...order, status: "CANCELLED" }).output();
  assert.ok(pdf.includes("CANCELLED"));
  assert.ok(!pdf.includes("Payment due on delivery"));
});
