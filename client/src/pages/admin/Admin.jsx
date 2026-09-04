import { useState } from "react";
import { useApp } from "../../context/AppContext";
import AdminDashboard from "./components/AdminDashboard";
import OrderManagement from "./components/OrderManagement";
import ProductManagement from "./components/ProductManagement";

export default function Admin() {
  const { api, user } = useApp();
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const refreshDashboard = () => setDashboardRefreshKey((key) => key + 1);

  if (user?.role !== "admin") {
    return <main className="container-x py-20 text-center">Admin access required.</main>;
  }

  return (
    <main className="container-x py-10">
      <p className="text-sm font-bold text-amber-600">TechCommerce ADMIN</p>
      <h1 className="text-4xl font-extrabold">Store management</h1>
      <p className="mt-2 text-slate-500">Manage catalog, inventory, product galleries, variants, and fulfillment.</p>
      <AdminDashboard api={api} refreshKey={dashboardRefreshKey} />
      <ProductManagement api={api} onMutation={refreshDashboard} />
      <OrderManagement api={api} onMutation={refreshDashboard} />
    </main>
  );
}
