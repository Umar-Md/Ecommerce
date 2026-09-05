import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
import { downloadBill } from "../../utils/downloadBill";
const steps = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
export default function OrderDetails() {
  const { id } = useParams();
  const { api } = useApp();
  const [o, setO] = useState(null);
  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setO(r.data)).catch((error) => toast.error(error.response?.data?.message || "Could not load order"));
  }, [id]);
  if (!o) return <main className="container-x py-20">Loading...</main>;
  const idx = steps.indexOf(o.status);
  return (
    <main className="container-x py-10">
      <h1 className="text-3xl font-extrabold">
        Order #{o._id.slice(-8).toUpperCase()}
      </h1>
      <p className="mt-2 break-all text-sm text-slate-500">Order ID: {o._id}</p>
      <button
        className="btn-primary mt-4"
        onClick={() => {
          try {
            downloadBill(o);
          } catch {
            toast.error("Could not download your bill. Please try again.");
          }
        }}
      >
        Download bill (PDF)
      </button>
      <div className="card mt-8 overflow-hidden p-6">
        <div className="flex justify-between gap-2 overflow-auto">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`min-w-24 text-center text-xs font-bold ${i <= idx ? "" : "text-slate-400"}`}
            >
              <div
                className={`mx-auto mb-2 h-8 w-8 rounded-full border-2 ${i <= idx ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : ""}`}
              >
                {i + 1}
              </div>
              {s.replaceAll("_", " ")}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-bold">Items</h2>
          {o.items.map((x) => (
            <div key={x._id} className="mt-4 flex justify-between">
              <span>
                {x.name} × {x.quantity}
              </span>
              <b>₹{(x.price * x.quantity).toLocaleString("en-IN")}</b>
            </div>
          ))}
        </div>
        <div className="card p-6">
          <h2 className="font-bold">Shipping</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {o.shippingAddress.fullName}
            <br />
            {o.shippingAddress.line1}
            <br />
            {o.shippingAddress.city}, {o.shippingAddress.state} —{" "}
            {o.shippingAddress.postalCode}
            <br />
            {o.shippingAddress.phone}
          </p>
          <div className="mt-5 border-t pt-4 flex justify-between font-extrabold">
            <span>Total</span>
            <span>₹{o.total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
