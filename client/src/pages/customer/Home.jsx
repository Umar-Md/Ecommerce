import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function Home() {
  const { api } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/products?limit=8")
      .then((r) => setProducts(r.data.products || []))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load products"))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main>
      <section className="container-x py-8 md:py-14">
        <div className="overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-16 text-white md:px-14 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4" /> New season, new essentials
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-7xl">
              Better things.
              <br />
              <span className="text-slate-400">Beautifully chosen.</span>
            </h1>
            <p className="mt-5 max-w-xl text-slate-300 md:text-lg">
              Discover considered products across fashion, lifestyle and
              everyday essentials.
            </p>
            <Link className="btn mt-8 bg-white text-slate-900" to="/products">
              Explore collection <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="container-x grid gap-4 pb-10 sm:grid-cols-3">
        <div className="card p-6">
          <Truck />
          <h3 className="mt-4 font-bold">Fast delivery</h3>
          <p className="mt-1 text-sm text-slate-500">
            Reliable delivery across India.
          </p>
        </div>
        <div className="card p-6">
          <ShieldCheck />
          <h3 className="mt-4 font-bold">Secure checkout</h3>
          <p className="mt-1 text-sm text-slate-500">
            Payments protected end to end.
          </p>
        </div>
        <div className="card p-6">
          <RefreshCw />
          <h3 className="mt-4 font-bold">Easy returns</h3>
          <p className="mt-1 text-sm text-slate-500">
            Simple 7-day return policy.
          </p>
        </div>
      </section>
      <section className="container-x py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-400">
              CURATED FOR YOU
            </p>
            <h2 className="text-3xl font-extrabold">Trending now</h2>
          </div>
          <Link to="/products" className="hidden text-sm font-bold sm:block">
            View all →
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
      <section className="container-x py-12">
        <div className="rounded-3xl bg-slate-200 p-8 dark:bg-slate-900 md:p-14">
          <div className="max-w-2xl">
            <p className="text-sm font-bold">MEMBERS GET MORE</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
              10% off your first order.
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Join the TechCommerce list for early access, exclusive offers and new
              arrivals.
            </p>
            <div className="mt-6 flex max-w-md">
              <input
                className="input rounded-r-none"
                placeholder="you@example.com"
              />
              <button className="btn-primary rounded-l-none">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
