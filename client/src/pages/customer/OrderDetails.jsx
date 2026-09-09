import { useEffect, useRef, useState } from "react";
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
  const [cancelling, setCancelling] = useState(false);
  const cancelLock = useRef(false);
  const cancel = async () => {
    if (cancelLock.current || !window.confirm("Cancel this order? This cannot be undone.")) return;
    cancelLock.current = true;
    setCancelling(true);
    try {
      const { data } = await api.patch(`/orders/${id}/cancel`);
      setO(data);
      toast.success("Order cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not cancel order");
      if (error.response?.status === 409) {
        try { const { data } = await api.get(`/orders/${id}`); setO(data); } catch { /* Keep the last loaded order. */ }
      }
    } finally { cancelLock.current = false; setCancelling(false); }
  };
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
      {["PENDING", "PROCESSING"].includes(o.status) && (
        <button className="ml-3 mt-4 rounded-xl border border-red-300 px-4 py-3 font-semibold text-red-600 disabled:opacity-50" disabled={cancelling} onClick={cancel}>
          {cancelling ? "Cancelling..." : "Cancel order"}
        </button>
      )}
      <p className="mt-3 text-sm text-slate-500">{o.status === "CANCELLED" ? "This order has been cancelled." : ["SHIPPED", "DELIVERED"].includes(o.status) ? "This order has shipped and can no longer be cancelled." : "You can cancel your order before it ships."}</p>
      <div className="card mt-8 overflow-hidden p-6">
        {o.status === "CANCELLED" ? <p className="font-bold text-red-600" role="status">Order cancelled</p> : <div className="flex justify-between gap-2 overflow-auto">
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
        </div>}
      </div>
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-dashed border-slate-300 bg-white p-6 shadow-sm sm:p-10">
        <div className="border-b border-dashed border-slate-300 pb-6 text-center">
          <p className="text-xl font-black tracking-tight">TechCommerce</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Order receipt</p>
          <p className="mt-4 break-all text-xs text-slate-500">#{o._id}</p>
        </div>
        <div className="border-b border-dashed border-slate-300 py-6">
          {o.items.map((x) => (
            <div key={x._id} className="flex justify-between gap-4 py-2 text-sm">
              <span>{x.name} × {x.quantity}</span>
              <b className="whitespace-nowrap">₹{(x.price * x.quantity).toLocaleString("en-IN")}</b>
            </div>
          ))}
        </div>
        <div className="space-y-3 border-b border-dashed border-slate-300 py-6 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{o.subtotal.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>₹{o.shipping.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>₹{o.tax.toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between pt-2 text-lg font-black"><span>Total</span><span>₹{o.total.toLocaleString("en-IN")}</span></div>
        </div>
        <div className="pt-6 text-center text-sm text-slate-500">
          <p className="font-semibold text-slate-700">Deliver to</p>
          <p className="mt-2 leading-6">{o.shippingAddress.fullName}<br />{o.shippingAddress.line1}<br />{o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.postalCode}<br />{o.shippingAddress.phone}</p>
          <p className="mt-6 text-xs">Thank you for your purchase!</p>
          <button
            className="btn-primary mt-6 w-full"
            onClick={() => {
              try {
                downloadBill(o);
              } catch {
                toast.error("Could not download your receipt. Please try again.");
              }
            }}
          >
            Download receipt
          </button>
        </div>
      </div>
    </main>
  );
}
