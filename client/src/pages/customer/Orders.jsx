import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";

// Helper component for safe image loading with fallback icon
function OrderItemImage({ item }) {
  const [imgError, setImgError] = useState(false);

  // Extract valid image URL from typical backend schemas
  const getImageUrl = (item) => {
    if (typeof item === "string") return item;
    if (item?.image) return item.image;
    if (item?.product?.image) return item.product.image;
    if (typeof item?.product?.images === "string") return item.product.images.split(",")[0]?.trim();
    if (Array.isArray(item?.product?.images)) return item.product.images[0];
    return null;
  };

  const src = getImageUrl(item);

  if (!src || imgError) {
    return (
      <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden">
      <img
        src={src}
        alt={item?.name || item?.product?.name || "Product"}
        className="h-full w-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function Orders() {
  const { api, user } = useApp();
  const [orders, setOrders] = useState([]);
  const [cancelling, setCancelling] = useState({});
  const [loading, setLoading] = useState(true);
  const pending = useRef(new Set());

  const cancelOrder = async (order) => {
    if (!["PENDING", "PROCESSING"].includes(order.status) || pending.current.has(order._id)) return;
    if (!window.confirm(`Cancel order #${order._id.slice(-8).toUpperCase()}? This cannot be undone.`)) return;

    pending.current.add(order._id);
    setCancelling((current) => ({ ...current, [order._id]: true }));
    try {
      const { data } = await api.patch(`/orders/${order._id}/cancel`);
      setOrders((current) => current.map((item) => (item._id === order._id ? data : item)));
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not cancel order");
      if (error.response?.status === 409) {
        try {
          const { data } = await api.get(`/orders/${order._id}`);
          setOrders((current) => current.map((item) => (item._id === order._id ? data : item)));
        } catch {
          toast.error("Refresh the page to see the latest order status");
        }
      }
    } finally {
      pending.current.delete(order._id);
      setCancelling((current) => ({ ...current, [order._id]: false }));
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      api
        .get("/orders")
        .then((r) => setOrders(r.data.orders || []))
        .catch((error) => toast.error(error.response?.data?.message || "Could not load orders"))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "SHIPPED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "PROCESSING":
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  if (!user) {
    return (
      <main className="container-x py-20 text-center max-w-xl mx-auto px-4">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sign in required</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Please sign in to view your order history and track shipments.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container-x py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-slate-800">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                My Orders
              </h1>
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Track packages or cancel eligible orders before they ship.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((o) => {
            const isCancelable = ["PENDING", "PROCESSING"].includes(o.status);
            const items = o.items || o.products || [];

            return (
              <article
                key={o._id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <Link
                        to={`/orders/${o._id}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                      >
                        Order #{o._id.slice(-8).toUpperCase()}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusBadge(o.status)}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {o.status?.toLowerCase() || "pending"}
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      ₹{(o.total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Content Row: Safe Image Rendering & Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {items.slice(0, 4).map((item, idx) => (
                      <OrderItemImage key={idx} item={item} />
                    ))}
                    {items.length > 4 && (
                      <div className="h-12 w-12 flex-shrink-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                    <Link
                      to={`/orders/${o._id}`}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      View Details
                    </Link>

                    {isCancelable ? (
                      <button
                        type="button"
                        disabled={cancelling[o._id]}
                        onClick={() => cancelOrder(o)}
                        className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors disabled:opacity-50"
                      >
                        {cancelling[o._id] ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Cancelling...
                          </span>
                        ) : (
                          "Cancel Order"
                        )}
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {o.status === "CANCELLED" ? "Order cancelled" : "Shipping locked"}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {!orders.length && (
            <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center bg-slate-50/50 dark:bg-slate-900/30">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No orders found</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">You haven't placed any orders yet.</p>
              <Link
                to="/products"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
              >
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}