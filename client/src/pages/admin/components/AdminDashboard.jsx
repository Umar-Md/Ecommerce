import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const stats = [
  {
    key: "revenue",
    label: "Revenue",
    format: (v) => `₹${v.toLocaleString("en-IN")}`,
  },
  { key: "orders", label: "Orders" },
  { key: "customers", label: "Customers" },
  { key: "products", label: "Products" },
  { key: "pendingOrders", label: "Pending" },
];

export default function AdminDashboard({ api, refreshKey }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then(({ data }) => setDashboard(data))
      .catch((error) =>
        toast.error(
          error.response?.data?.message || "Could not load dashboard",
        ),
      );
  }, [api, refreshKey]);

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map(({ key, label, format }) => {
        const value = dashboard?.[key] || 0;

        return (
          <div
            key={key}
            className="group rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-slate-200 p-5 shadow-[0_6px_0_#cbd5e1,0_12px_20px_-6px_rgba(15,23,42,0.3)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_#cbd5e1,0_18px_25px_-6px_rgba(15,23,42,0.35)] dark:border-slate-700 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:shadow-[0_6px_0_#0f172a,0_12px_20px_-6px_rgba(0,0,0,0.5)]"
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </p>

            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {format ? format(value) : value.toLocaleString("en-IN")}
            </p>

            <div className="mt-4 h-1 w-10 rounded-full bg-amber-500 transition-all duration-200 group-hover:w-14" />
          </div>
        );
      })}
    </div>
  );
}