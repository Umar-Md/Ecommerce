import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function Orders() {
  const { api, user } = useApp();
  const [orders, setOrders] = useState([]);
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
      <div className="mt-8 space-y-3">
        {orders.map((o) => (
          <Link
            to={`/orders/${o._id}`}
            key={o._id}
            className="card flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <b>#{o._id.slice(-8).toUpperCase()}</b>
              <p className="text-sm text-slate-500">
                {new Date(o.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">
              {o.status}
            </span>
            <b>₹{o.total.toLocaleString("en-IN")}</b>
          </Link>
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
