import { useApp } from "../context/AppContext";
import AdminNavbar from "./admin/AdminNavbar";
import CustomerNavbar from "./customer/CustomerNavbar";

export default function Navbar() {
  const { user } = useApp();
  return user?.role === "admin" ? <AdminNavbar /> : <CustomerNavbar />;
}
