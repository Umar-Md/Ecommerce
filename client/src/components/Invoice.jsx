
import React, { useRef } from "react";
import { downloadBill, billDate } from "../utils/downloadBill";


export default function Invoice({ order }) {
  const invoiceRef = useRef(null);

  const money = (value) =>
    `â‚¹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;

  const downloadPDF = () => downloadBill(order);

  const address = order.shippingAddress || {};

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      {/* Download button */}
      <div className="mx-auto mb-6 flex max-w-4xl justify-end">
        <button
          onClick={downloadPDF}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          Download Invoice
        </button>
      </div>

      {/* INVOICE */}
      <div
        ref={invoiceRef}
        className="mx-auto w-full max-w-4xl bg-white text-slate-900 shadow-xl"
      >

        {/* HEADER */}
        <div className="bg-slate-900 px-10 py-8 text-white">
          <div className="flex items-start justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                TechCommerce
              </h1>

              <p className="mt-1 text-sm text-slate-300">
                Quality products, delivered to you
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-3xl font-bold tracking-widest">
                INVOICE
              </h2>

              <p className="mt-2 text-sm text-slate-300">
                #{order._id}
              </p>
            </div>

          </div>
        </div>

        {/* CONTENT */}
        <div className="p-10">

          {/* ORDER INFO */}
          <div className="mb-8 grid grid-cols-3 gap-6">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Order Date & Time
              </p>

              <p className="mt-1 text-sm font-semibold">
                {order.createdAt
                  ? billDate(order.createdAt).display
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Payment Method
              </p>

              <p className="mt-1 text-sm font-semibold">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentMethod || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Payment Status
              </p>

              <span
                className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {order.paymentStatus || "PENDING"}
              </span>
            </div>

          </div>

          {/* CUSTOMER */}
          <div className="mb-10 grid grid-cols-2 gap-6">

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer
              </p>

              <h3 className="font-semibold text-slate-900">
                {address.fullName || "-"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {address.line1}
                <br />

                {address.city}, {address.state}
                <br />

                {address.postalCode}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Phone: {address.phone || "-"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                Order Status
              </p>

              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                {order.status || "PROCESSING"}
              </span>

              <p className="mt-5 text-sm text-slate-500">
                Order ID
              </p>

              <p className="mt-1 break-all text-sm font-semibold">
                {order._id}
              </p>
            </div>

          </div>

          {/* ITEMS */}
          <div className="mb-8">

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
              Order Items
            </h3>

            <div className="overflow-hidden rounded-xl border border-slate-200">

              {/* TABLE HEADER */}
              <div className="grid grid-cols-12 bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white">

                <div className="col-span-6">
                  Product
                </div>

                <div className="col-span-2 text-center">
                  Qty
                </div>

                <div className="col-span-2 text-right">
                  Price
                </div>

                <div className="col-span-2 text-right">
                  Amount
                </div>

              </div>

              {/* PRODUCTS */}
              {order.items?.map((item, index) => (

                <div
                  key={item._id || index}
                  className="grid grid-cols-12 items-center border-t border-slate-200 px-5 py-4 text-sm"
                >

                  <div className="col-span-6 font-medium text-slate-800">
                    {item.name}
                  </div>

                  <div className="col-span-2 text-center text-slate-600">
                    {item.quantity}
                  </div>

                  <div className="col-span-2 text-right text-slate-600">
                    {money(item.price)}
                  </div>

                  <div className="col-span-2 text-right font-semibold text-slate-900">
                    {money(
                      Number(item.price || 0) *
                        Number(item.quantity || 0)
                    )}
                  </div>

                </div>

              ))}

            </div>
          </div>

          {/* TOTAL */}
          <div className="flex justify-end">

            <div className="w-full max-w-sm">

              <div className="space-y-3 border-b border-slate-200 pb-4">

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-medium">
                    {money(order.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Shipping
                  </span>

                  <span className="font-medium">
                    {money(order.shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Tax
                  </span>

                  <span className="font-medium">
                    {money(order.tax)}
                  </span>
                </div>

              </div>

              <div className="flex items-center justify-between pt-4">

                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold text-slate-900">
                  {money(order.total)}
                </span>

              </div>

            </div>

          </div>

          {/* COD NOTICE */}
          {order.status !== "CANCELLED" && order.paymentMethod === "COD" &&
            order.paymentStatus === "PENDING" && (

              <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <p className="text-sm font-semibold text-amber-800">
                  Payment due on delivery
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Please keep the exact payable amount ready
                  when your order arrives.
                </p>

              </div>
            )}

          {/* FOOTER */}
          <div className="mt-12 border-t border-slate-200 pt-6 text-center">

            <p className="text-sm font-semibold text-slate-700">
              Thank you for your purchase!
            </p>

            <p className="mt-1 text-xs text-slate-400">
              We appreciate your business and hope to serve you again.
            </p>

            <p className="mt-4 text-xs text-slate-400">
              TechCommerce
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}
