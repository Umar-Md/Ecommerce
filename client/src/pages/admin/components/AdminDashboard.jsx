import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminDashboard({ api, refreshKey }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setDashboard(response.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Could not load dashboard",
        );
      }
    };
    loadDashboard();
  }, [api, refreshKey]);

  const stats = [
    ["Revenue", `₹${(dashboard?.revenue || 0).toLocaleString("en-IN")}`],
    ["Orders", dashboard?.orders || 0],
    ["Customers", dashboard?.customers || 0],
    ["Products", dashboard?.products || 0],
    ["Pending", dashboard?.pendingOrders || 0],
  ];

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map(([label, value]) => (
        <div className="card p-5" key={label}>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold">{value}</p>
        </div>
      ))}
    </div>
  );
}
