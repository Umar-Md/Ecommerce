import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ORDER_TRANSITIONS } from "../constants";

export default function OrderManagement({ api, onMutation }) {
  const [orders, setOrders] = useState([]);

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
    try {
      await api.patch(`/orders/admin/${id}/status`, { status });
      toast.success("Order status updated");
      await loadOrders();
      onMutation();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update order");
    }
  };

  return (
    <section className="card mt-8 overflow-x-auto p-6">
      <h2 className="text-xl font-bold">Customer orders</h2>
      <table className="mt-4 min-w-[680px] w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3">Order</th><th>Customer</th><th>Total</th>
            <th>Current status</th><th>Next action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="border-b dark:border-slate-800" key={order._id}>
              <td className="py-3 font-mono">{order._id.slice(-8).toUpperCase()}</td>
              <td>{order.user?.name || "Unknown"}</td>
              <td>₹{order.total?.toLocaleString("en-IN")}</td>
              <td>{order.status}</td>
              <td>
                <select
                  aria-label={`Update order ${order._id} status`}
                  className="input w-auto"
                  value=""
                  disabled={!ORDER_TRANSITIONS[order.status]?.length}
                  onChange={(event) => updateStatus(order._id, event.target.value)}
                >
                  <option value="">Select action</option>
                  {ORDER_TRANSITIONS[order.status]?.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
