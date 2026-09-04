import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
export default function Account() {
  const { user } = useApp();
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">My account</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="card p-6 hover:-translate-y-1 transition" to="/orders">
          <b>Orders</b>
          <p className="mt-2 text-sm text-slate-500">
            Track purchases and returns
          </p>
        </Link>
        <Link className="card p-6" to="/wishlist">
          <b>Wishlist</b>
          <p className="mt-2 text-sm text-slate-500">Your saved products</p>
        </Link>
        <div className="card p-6">
          <b>Profile</b>
          <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
        </div>
        <div className="card p-6">
          <b>Addresses</b>
          <p className="mt-2 text-sm text-slate-500">
            Manage delivery addresses
          </p>
        </div>
      </div>
    </main>
  );
}
