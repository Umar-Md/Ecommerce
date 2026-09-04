import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function ProductDetails() {
  const { id } = useParams();
  const { api, addToCart, user } = useApp();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(0);
  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setP(r.data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load product"));
  }, [id]);
  if (!p) return <div className="container-x py-20">Loading product...</div>;
  const imgs = p.images?.map((x) => x.url || x) || [
    "https://placehold.co/800x1000",
  ];
  const add = () => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    addToCart(p, qty);
    toast.success("Added to cart");
  };
  const save = async () => {
    if (!user) return toast.error("Sign in to use your wishlist");
    try { await api.post("/wishlist", { productId: p._id }); toast.success("Saved to wishlist"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update wishlist"); }
  };
  return (
    <main className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3 md:grid-cols-[90px_1fr]">
          <div className="order-2 flex gap-2 overflow-auto md:order-1 md:flex-col">
            {imgs.map((x, i) => (
              <button
                key={x + i}
                onClick={() => setImage(i)}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border ${image === i ? "ring-2 ring-slate-900" : ""}`}
              >
                <img src={x} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 md:order-2">
            <img src={imgs[image]} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="py-2">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {p.brand?.name || "Velora"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">{p.name}</h1>
          <div className="mt-4 flex items-center gap-2">
            <Star className="h-5 w-5 fill-current" />
            {p.rating?.toFixed?.(1) || "4.8"}{" "}
            <span className="text-slate-400">
              ({p.numReviews || 0} reviews)
            </span>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-extrabold">
              ₹{p.price.toLocaleString("en-IN")}
            </span>
            {p.originalPrice > p.price && (
              <del className="ml-3 text-slate-400">
                ₹{p.originalPrice.toLocaleString("en-IN")}
              </del>
            )}
          </div>
          <p className="mt-6 leading-7 text-slate-600 dark:text-slate-300">
            {p.description}
          </p>
          <div className="my-7 h-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="font-bold">Quantity</span>
            <div className="mt-3 inline-flex items-center rounded-xl border">
              <button
                className="p-3"
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus />
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button className="p-3" disabled={qty >= Math.min(p.stock, 20)} onClick={() => setQty(Math.min(qty + 1, p.stock, 20))}>
                <Plus />
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button disabled={p.stock <= 0} className="btn-primary py-4" onClick={add}>
              <ShoppingBag className="mr-2" /> Add to cart
            </button>
            <button className="btn-soft py-4" onClick={save}>
              <Heart className="mr-2" /> Wishlist
            </button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Truck />
              <div>
                <b>Fast delivery</b>
                <p className="text-sm text-slate-500">
                  Estimated 2–5 business days
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <RotateCcw />
              <div>
                <b>Easy returns</b>
                <p className="text-sm text-slate-500">7-day return window</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
