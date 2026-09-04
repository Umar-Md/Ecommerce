import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
export default function Cart() {
  const { cart, updateQty, removeFromCart } = useApp();
  const nav = useNavigate();
  const subtotal = cart.reduce((s, x) => s + x.product.price * x.quantity, 0);
  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">Your cart</h1>
      {!cart.length ? (
        <div className="card mt-8 p-12 text-center">
          <h2 className="text-2xl font-bold">Your cart is empty</h2>
          <p className="mt-2 text-slate-500">
            Find something you love and bring it home.
          </p>
          <Link className="btn-primary mt-6" to="/products">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-3">
            {cart.map((x) => (
              <div className="card flex gap-4 p-4" key={x.product._id}>
                <img
                  src={
                    x.product.images?.[0]?.url ||
                    x.product.images?.[0] ||
                    "https://placehold.co/200"
                  }
                  className="h-28 w-24 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${x.product._id}`} className="font-bold">
                    {x.product.name}
                  </Link>
                  <p className="mt-1 font-semibold">
                    ₹{x.product.price.toLocaleString("en-IN")}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-xl border">
                      <button
                        className="p-2"
                        onClick={() => updateQty(x.product._id, x.quantity - 1)}
                      >
                        <Minus className="h-4" />
                      </button>
                      <span className="w-8 text-center">{x.quantity}</span>
                      <button
                        className="p-2"
                        onClick={() => updateQty(x.product._id, x.quantity + 1)}
                      >
                        <Plus className="h-4" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(x.product._id)}>
                      <Trash2 className="h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="card h-fit p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-extrabold">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping ? "₹99" : "Free"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>
              <div className="border-t pt-4 text-lg font-extrabold flex justify-between">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <button
              onClick={() => nav("/checkout")}
              className="btn-primary mt-6 w-full"
            >
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
