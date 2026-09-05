import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ORDER_TRANSITIONS } from "../constants";
import { downloadBill } from "../../../utils/downloadBill";

const actionLabels = { PROCESSING: "Start processing", SHIPPED: "Mark shipped", DELIVERED: "Mark delivered", CANCELLED: "Cancel order" };

export default function OrderManagement({ api, onMutation }) {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const selected = orders.find((order) => order._id === selectedId);
  const pending = useRef(new Set());

  const loadOrders = useCallback(async () => {
    try {
      const response = await api.get("/orders/admin/all");
      setOrders(response.data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load orders");
    }
  }, [api]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const updateStatus = async (id, status) => {
    if (!status || pending.current.has(id)) return;
    if (status === "CANCELLED" && !window.confirm("Cancel this order and restore its stock? This cannot be undone.")) return;
    if (status === "PAID" && !window.confirm("Confirm that the cash-on-delivery payment has been received?")) return;
    pending.current.add(id);
    setUpdating((current) => ({ ...current, [id]: true }));
    try {
      const { data } = await api.patch(`/orders/admin/${id}/${status === "PAID" ? "payment" : "status"}`, { status });
      setOrders((current) => current.map((order) => order._id === id ? { ...order, ...data, user: order.user } : order));
      toast.success(status === "PAID" ? "Payment recorded" : "Order status updated");
      onMutation();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update order");
      if (error.response?.status === 409) await loadOrders();
    } finally {
      pending.current.delete(id);
      setUpdating((current) => ({ ...current, [id]: false }));
    }
  };

  return (
    <section className="card mt-8 overflow-x-auto p-6">
      <h2 className="text-xl font-bold">Customer orders</h2>
      <p className="mt-2 text-sm text-slate-500">Process orders, mark shipments and deliveries, and confirm payment after cash is collected. Cancellation is available before shipment.</p>
      <button type="button" className="mt-3 text-sm font-semibold underline" onClick={loadOrders}>Refresh orders</button>
      <table className="mt-4 min-w-[680px] w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3">Order</th><th>Customer</th><th>Total</th>
            <th>Current status</th><th>Payment</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="border-b dark:border-slate-800" key={order._id}>
              <td className="py-3 font-mono">{order._id.slice(-8).toUpperCase()}</td>
              <td>{order.user?.name || "Unknown"}</td>
              <td>₹{order.total?.toLocaleString("en-IN")}</td>
              <td>{order.status}</td>
              <td>{order.paymentMethod}<br /><span className="text-xs text-slate-500">{order.paymentStatus}</span></td>
              <td>
                <div className="flex max-w-md flex-wrap gap-2 py-3">
                  <button className="rounded-lg border px-3 py-2 text-xs font-semibold" onClick={() => setSelectedId(selectedId === order._id ? null : order._id)}>View details</button>
                  <button className="rounded-lg border px-3 py-2 text-xs font-semibold" onClick={() => { try { downloadBill(order); } catch { toast.error("Could not download bill"); } }}>Download bill</button>
                  {ORDER_TRANSITIONS[order.status]?.map((status) => (
                    <button key={status} disabled={updating[order._id]} className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${status === "CANCELLED" ? "border-red-200 text-red-600" : "border-slate-300"}`} onClick={() => updateStatus(order._id, status)}>{actionLabels[status]}</button>
                  ))}
                  {order.status === "DELIVERED" && order.paymentMethod === "COD" && order.paymentStatus === "PENDING" && (
                    <button disabled={updating[order._id]} className="rounded-lg border border-green-300 px-3 py-2 text-xs font-semibold text-green-700 disabled:opacity-50" onClick={() => updateStatus(order._id, "PAID")}>Confirm COD payment</button>
                  )}
                  {updating[order._id] && <span className="text-xs" role="status">Updating...</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && <p className="py-6 text-sm text-slate-500">No orders to display.</p>}
      {selected && (
        <div className="mt-6 rounded-xl border p-5">
          <div className="flex flex-wrap justify-between gap-3"><h3 className="break-all font-bold">Order {selected._id}</h3><button className="text-sm underline" onClick={() => setSelectedId(null)}>Close details</button></div>
          <p className="mt-2 text-sm text-slate-500">{new Date(selected.createdAt).toLocaleString("en-IN")} · {selected.status} · Payment {selected.paymentStatus}</p>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div><h4 className="font-semibold">Ship to</h4><p className="mt-2 text-sm leading-6">{selected.shippingAddress?.fullName}<br />{selected.shippingAddress?.line1}<br />{selected.shippingAddress?.city}, {selected.shippingAddress?.state} {selected.shippingAddress?.postalCode}<br />{selected.shippingAddress?.phone}</p></div>
            <div><h4 className="font-semibold">Items</h4>{selected.items?.map((item, index) => <p key={item._id || index} className="mt-2 text-sm">{item.name} × {item.quantity} — INR {(item.price * item.quantity).toLocaleString("en-IN")}</p>)}</div>
          </div>
        </div>
      )}
    </section>
  );
}
