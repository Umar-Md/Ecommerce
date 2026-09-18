import { Link } from "react-router-dom";
import { useState } from "react";
import CheckoutAddress from "../../components/CheckoutAddress";
import { useApp } from "../../context/AppContext";
export default function Account() {
  const { user } = useApp();
  const [address, setAddress] = useState({ fullName: "", phone: "", line1: "", city: "", state: "", postalCode: "" });
  const [showAddresses, setShowAddresses] = useState(false);
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">My account</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="card p-6 hover:-translate-y-1 transition" to="/orders">
          <b>Orders</b>
          <p className="mt-2 text-sm text-slate-500">
            View purchases or cancel before shipment
          </p>
        </Link>
        <Link className="card p-6" to="/wishlist">
          <b>Wishlist</b>
          <p className="mt-2 text-sm text-slate-500">Your saved products</p>
        </Link>
        <div className="card p-6">
          <b>Profile</b>
          <p className="mt-2">{user?.name}</p>
          <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
          <p className="mt-2 text-sm text-slate-500">{user?.phone}</p>
        </div>
        <button type="button" className="card p-6 text-left" aria-expanded={showAddresses} aria-controls="account-addresses" onClick={() => setShowAddresses((value) => !value)}>
          <b>Addresses</b>
          <p className="mt-2 text-sm text-slate-500">
            Manage delivery addresses
          </p>
        </button>
      </div>
      {showAddresses && <section id="account-addresses" className="card mt-8 max-w-3xl p-6"><h2 className="text-xl font-bold">Saved addresses</h2><CheckoutAddress address={address} setAddress={setAddress} /></section>}
    </main>
  );
}
