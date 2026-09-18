import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ORDER_TRANSITIONS } from "../constants";
import { downloadBill } from "../../../utils/downloadBill";

const actionLabels = {
  PROCESSING: "Start Processing",
  SHIPPED: "Mark Shipped",
  DELIVERED: "Mark Delivered",
  CANCELLED: "Cancel Order",
};

const statusStyles = {
  PROCESSING: "bg-blue-50 text-blue-700 ring-blue-600/20",
  SHIPPED: "bg-purple-50 text-purple-700 ring-purple-600/20",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const Badge = ({ children }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
      statusStyles[children] || "bg-slate-100 text-slate-600 ring-slate-500/20"
    }`}
  >
    {children}
  </span>
);

export default function OrderManagement({ api, onMutation }) {
  const [orders, setOrders] = useState([]);
  const [updating, setUpdating] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const pending = useRef(new Set());

  const selected = orders.find(({ _id }) => _id === selectedId);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get("/orders/admin/all");
      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load orders");
    }
  }, [api]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (id, status) => {
    if (!status || pending.current.has(id)) return;

    const message =
      status === "CANCELLED"
        ? "Cancel this order and restore its stock? This cannot be undone."
        : status === "PAID"
          ? "Confirm that the cash-on-delivery payment has been received?"
          : null;

    if (message && !window.confirm(message)) return;

    pending.current.add(id);
    setUpdating((state) => ({ ...state, [id]: true }));

    try {
      const endpoint = status === "PAID" ? "payment" : "status";
      const { data } = await api.patch(`/orders/admin/${id}/${endpoint}`, {
        status,
      });

      setOrders((current) =>
        current.map((order) =>
          order._id === id ? { ...order, ...data, user: order.user } : order
        )
      );

      toast.success(
        status === "PAID" ? "Payment recorded" : "Order status updated"
      );
      onMutation();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update order");
      if (error.response?.status === 409) await loadOrders();
    } finally {
      pending.current.delete(id);
      setUpdating((state) => ({ ...state, [id]: false }));
    }
  };

  const handleDownload = (order) => {
    try {
      downloadBill(order);
    } catch {
      toast.error("Could not download bill");
    }
  };

  return (
    <section className="card mt-8 overflow-hidden">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b p-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Customer Orders</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage fulfillment, payments, and customer orders.
          </p>
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          ↻ Refresh
        </button>
      </header>

      {/* Orders */}
      {!orders.length ? (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-800">
            📦
          </div>
          <p className="mt-3 font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="border-b dark:border-slate-800">
                {["Order", "Customer", "Total", "Status", "Payment", "Actions"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => {
                const busy = updating[order._id];
                const isSelected = selectedId === order._id;

                return (
                  <tr
                    key={order._id}
                    className={`border-b transition dark:border-slate-800 ${
                      isSelected
                        ? "bg-slate-50 dark:bg-slate-900/50"
                        : "hover:bg-slate-50/70 dark:hover:bg-slate-900/30"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-bold">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {order.user?.name || "Unknown"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      ₹{order.total?.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <Badge>{order.status}</Badge>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">{order.paymentMethod}</p>
                      <div className="mt-1">
                        <Badge>{order.paymentStatus}</Badge>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex max-w-md flex-wrap gap-2">
                        <button
                          onClick={() =>
                            setSelectedId(isSelected ? null : order._id)
                          }
                          className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {isSelected ? "Hide Details" : "View Details"}
                        </button>

                        <button
                          onClick={() => handleDownload(order)}
                          className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Download Bill
                        </button>

                        {ORDER_TRANSITIONS[order.status]?.map((status) => (
                          <button
                            key={status}
                            disabled={busy}
                            onClick={() => updateStatus(order._id, status)}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              status === "CANCELLED"
                                ? "border-red-200 text-red-600 hover:bg-red-50"
                                : "hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {actionLabels[status]}
                          </button>
                        ))}

                        {order.status === "DELIVERED" &&
                          order.paymentMethod === "COD" &&
                          order.paymentStatus === "PENDING" && (
                            <button
                              disabled={busy}
                              onClick={() => updateStatus(order._id, "PAID")}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                              Confirm COD
                            </button>
                          )}

                        {busy && (
                          <span className="self-center text-xs text-slate-500">
                            Updating...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details */}
      {selected && (
        <div className="border-t bg-slate-50 p-6 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order details
              </p>
              <h3 className="mt-1 font-bold">
                #{selected._id.slice(-8).toUpperCase()}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {new Date(selected.createdAt).toLocaleString("en-IN")}
              </p>
            </div>

            <button
              onClick={() => setSelectedId(null)}
              className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-white dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <div className="mt-2">
                <Badge>{selected.status}</Badge>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment
              </p>
              <p className="mt-2 font-semibold">{selected.paymentMethod}</p>
              <div className="mt-1">
                <Badge>{selected.paymentStatus}</Badge>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-5 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Order Total
              </p>
              <p className="mt-2 text-lg font-bold">
                ₹{selected.total?.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-white p-5 dark:bg-slate-950">
              <h4 className="font-semibold">Shipping Details</h4>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {selected.shippingAddress?.fullName}
                <br />
                {selected.shippingAddress?.line1}
                <br />
                {selected.shippingAddress?.city},{" "}
                {selected.shippingAddress?.state}{" "}
                {selected.shippingAddress?.postalCode}
                <br />
                {selected.shippingAddress?.phone}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 dark:bg-slate-950">
              <h4 className="font-semibold">Order Items</h4>

              <div className="mt-3 divide-y dark:divide-slate-800">
                {selected.items?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

