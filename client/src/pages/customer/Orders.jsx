import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function Orders() {
  const { api, user } = useApp();
  const [orders, setOrders] = useState([]);
  const [cancelling, setCancelling] = useState({});
  const pending = useRef(new Set());
  const cancelOrder = async (order) => {
    if (!["PENDING", "PROCESSING"].includes(order.status) || pending.current.has(order._id)) return;
    if (!window.confirm(`Cancel order #${order._id.slice(-8).toUpperCase()}? This cannot be undone.`)) return;
    pending.current.add(order._id);
    setCancelling((current) => ({ ...current, [order._id]: true }));
    try {
      const { data } = await api.patch(`/orders/${order._id}/cancel`);
      setOrders((current) => current.map((item) => item._id === order._id ? data : item));
      toast.success("Order cancelled");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not cancel order");
      if (error.response?.status === 409) {
        try {
          const { data } = await api.get(`/orders/${order._id}`);
          setOrders((current) => current.map((item) => item._id === order._id ? data : item));
        } catch { toast.error("Refresh the page to see the latest order status"); }
      }
    } finally {
      pending.current.delete(order._id);
      setCancelling((current) => ({ ...current, [order._id]: false }));
    }
  };
  useEffect(() => {
    if (user) api.get("/orders").then((r) => setOrders(r.data.orders || [])).catch((error) => toast.error(error.response?.data?.message || "Could not load orders"));
  }, [user]);
  if (!user)
    return (
      <main className="container-x py-20 text-center">
        Please sign in to view orders.
      </main>
    );
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">Orders</h1>
      <p className="mt-3 text-sm text-slate-500">You can cancel pending or processing orders before they ship.</p>
      <div className="mt-8 space-y-3">
        {orders.map((o) => (
          <article
            key={o._id}
            className="card flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <Link to={`/orders/${o._id}`} className="font-bold underline">#{o._id.slice(-8).toUpperCase()}</Link>
              <p className="text-sm text-slate-500">
                {new Date(o.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
              {o.status}
            </span>
            <b>₹{o.total.toLocaleString("en-IN")}</b>
            <div className="flex flex-wrap items-center gap-3">
              <Link to={`/orders/${o._id}`} className="rounded-xl border px-4 py-2 text-sm font-semibold">View order</Link>
              {["PENDING", "PROCESSING"].includes(o.status) ? (
                <button type="button" disabled={cancelling[o._id]} onClick={() => cancelOrder(o)} className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50">
                  {cancelling[o._id] ? "Cancelling..." : "Cancel order"}
                </button>
              ) : (
                <span className="text-xs text-slate-500">{o.status === "CANCELLED" ? "Order cancelled" : "Cancellation unavailable after shipment"}</span>
              )}
            </div>
          </article>
        ))}
        {!orders.length && (
          <div className="card p-10 text-center text-slate-500">
            No orders yet.
          </div>
        )}
      </div>
    </main>
  );
}
