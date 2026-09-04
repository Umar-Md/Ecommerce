import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function Products() {
  const { api } = useApp();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ products: [], pages: 1 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get("/categories").then((response) => setCategories(response.data)).catch((error) => toast.error(error.response?.data?.message || "Could not load categories"));
  }, [api]);
  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: Object.fromEntries(params) })
      .then((r) => setData(r.data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load products"))
      .finally(() => setLoading(false));
  }, [params]);
  const set = (k) => (e) => {
    const n = new URLSearchParams(params);
    n.set(k, e.target.value);
    n.delete("page");
    setParams(n);
  };
  return (
    <main className="container-x py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">CATALOG</p>
          <h1 className="text-4xl font-extrabold">All products</h1>
          <p className="mt-2 text-slate-500">{data.total || 0} products</p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-auto"
            value={params.get("sort") || "featured"}
            onChange={set("sort")}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </select>
        </div>
      </div>
      <div className="mb-7 flex flex-wrap gap-2">
        <select
          className="input w-auto"
          value={params.get("category") || ""}
          onChange={set("category")}
        >
          <option value="">All categories</option>
          {categories.map((category) => <option key={category._id} value={category.slug}>{category.name}</option>)}
        </select>
        <select
          className="input w-auto"
          value={params.get("minPrice") || ""}
          onChange={set("minPrice")}
        >
          <option value="">Min price</option>
          <option value="500">₹500</option>
          <option value="1000">₹1,000</option>
          <option value="2500">₹2,500</option>
        </select>
        <select
          className="input w-auto"
          value={params.get("maxPrice") || ""}
          onChange={set("maxPrice")}
        >
          <option value="">Max price</option>
          <option value="2000">₹2,000</option>
          <option value="5000">₹5,000</option>
          <option value="10000">₹10,000</option>
        </select>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
      {data.pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                const n = new URLSearchParams(params);
                n.set("page", i + 1);
                setParams(n);
              }}
              className={`btn ${Number(params.get("page") || 1) === i + 1 ? "btn-primary" : "btn-soft"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
