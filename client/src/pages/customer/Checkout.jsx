import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
import CheckoutAddress from "../../components/CheckoutAddress";
export default function Checkout() {
  const { cart, api, user, clearCart } = useApp();
  const nav = useNavigate();
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [method, setMethod] = useState("COD");
  const [busy, setBusy] = useState(false);
  const subtotal = cart.reduce((s, x) => s + x.product.price * x.quantity, 0);
  const shipping = subtotal >= 1999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  if (!cart.length)
    return (
      <main className="container-x py-20 text-center">Your cart is empty.</main>
    );
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!user) {
      nav("/auth");
      return;
    }
    setBusy(true);
    try {
      const r = await api.post("/orders", {
        items: cart.map((x) => ({
          product: x.product._id,
          quantity: x.quantity,
        })),
        shippingAddress: address,
        paymentMethod: method,
      });
      toast.success("Order placed");
      clearCart();
      nav(`/orders/${r.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">Checkout</h1>
      <form
        onSubmit={submit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="card p-6">
          <h2 className="text-xl font-bold">Shipping address</h2>
          <CheckoutAddress address={address} setAddress={setAddress} disabled={busy} />
          <h2 className="mt-8 text-xl font-bold">Payment</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label
              className={`rounded-xl border p-4 ${method === "COD" ? "ring-2" : ""}`}
            >
              <input
                type="radio"
                checked={method === "COD"}
                onChange={() => setMethod("COD")}
              />{" "}
              <b className="ml-2">Cash on Delivery</b>
            </label>
            <div className="rounded-xl border p-4 opacity-60" aria-disabled="true">
              <b>Online payment</b>
              <p className="mt-1 text-xs text-slate-500">Coming soon</p>
            </div>
          </div>
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-xl font-bold">Summary</h2>
          <div className="mt-5 flex justify-between">
            <span>Items</span>
            <span>{cart.reduce((s, x) => s + x.quantity, 0)}</span>
          </div>
          <div className="mt-3 flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
          <div className="mt-3 flex justify-between"><span>Shipping</span><span>{shipping ? `₹${shipping}` : "Free"}</span></div>
          <div className="mt-3 flex justify-between"><span>Tax</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
          <div className="mt-3 flex justify-between text-lg font-extrabold">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-5 text-sm text-slate-500">Your receipt will be ready after the order is placed.</p>
          <button disabled={busy} className="btn-primary mt-6 w-full disabled:opacity-60">
            {busy ? "Processing..." : "Place order"}
          </button>
        </aside>
      </form>
    </main>
  );
}
