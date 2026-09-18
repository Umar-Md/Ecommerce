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
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState(params.get("search") || "");
  useEffect(() => { setSearch(params.get("search") || ""); }, [params]);
  useEffect(() => {
    let active = true;
    Promise.all([api.get("/categories"), api.get("/brands")])
      .then(([c, b]) => { if (active) { setCategories(c.data); setBrands(b.data); } })
      .catch(() => { if (active) toast.error("Could not load catalog filters"); });
    return () => { active = false; };
  }, [api]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get("/products", { params: Object.fromEntries(params) })
      .then((r) => { if (active) setData(r.data); })
      .catch((error) => { if (active) setError(error.response?.data?.message || "Could not load products"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params, api, retry]);
  const set = (k) => (e) => {
    const n = new URLSearchParams(params);
    if ((k === "minPrice" || k === "maxPrice") && e.target.value !== "" && Number(e.target.value) < 0) return;
    if (e.target.value === "") n.delete(k);
    else n.set(k, e.target.value);
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
            aria-label="Sort products"
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
      <form className="mb-4 flex gap-2" onSubmit={(event) => {
        event.preventDefault();
        const next = new URLSearchParams(params);
        if (search.trim()) next.set("search", search.trim()); else next.delete("search");
        next.delete("page");
        setParams(next);
      }}>
        <input type="search" aria-label="Search products" placeholder="Search products or keywords" maxLength={200} className="input flex-1" value={search} onChange={(event) => setSearch(event.target.value)} />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      <div className="mb-7 flex flex-wrap gap-2">
        <select
          aria-label="Category"
          className="input w-auto"
          value={params.get("category") || ""}
          onChange={set("category")}
        >
          <option value="">All categories</option>
          {categories.map((category) => <option key={category._id} value={category.slug || category._id}>{category.name}</option>)}
          {params.get("category") && !categories.some((category) => (category.slug || category._id) === params.get("category")) && <option value={params.get("category")}>{params.get("category")}</option>}
        </select>
        <select aria-label="Brand" className="input w-auto" value={params.get("brand") || ""} onChange={set("brand")}>
          <option value="">All brands</option>
          {brands.map((brand) => <option key={brand._id} value={brand._id}>{brand.name}</option>)}
        </select>
        <select aria-label="Minimum rating" className="input w-auto" value={params.get("rating") || ""} onChange={set("rating")}>
          <option value="">All ratings</option>
          {[4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}+ stars</option>)}
        </select>
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          aria-label="Min price"
          placeholder="Min price"
          className="input w-36"
          value={params.get("minPrice") || ""}
          onChange={set("minPrice")}
        />
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          aria-label="Max price"
          placeholder="Max price"
          className="input w-36"
          value={params.get("maxPrice") || ""}
          onChange={set("maxPrice")}
        />
        <label className="flex items-center gap-2 px-3"><input type="checkbox" checked={params.get("inStock") === "true"} onChange={(event) => set("inStock")({ target: { value: event.target.checked ? "true" : "" } })} />In stock only</label>
        <label className="flex items-center gap-2 px-3"><input type="checkbox" checked={params.get("discount") === "true"} onChange={(event) => set("discount")({ target: { value: event.target.checked ? "true" : "" } })} />On sale</label>
        {params.size > 0 && <button className="btn-soft" onClick={() => setParams({})}>Clear filters</button>}
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <div className="card p-10 text-center" role="alert"><p>{error}</p><button className="btn-primary mt-4" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>
      ) : data.products.length === 0 ? (
        <div className="card p-10 text-center"><h2 className="text-xl font-bold">No products found</h2><p className="mt-2 text-slate-500">Try a different search or clear your filters.</p><button className="btn-primary mt-4" onClick={() => setParams({})}>View all products</button></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
      {!loading && !error && data.pages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: data.pages }, (_, i) => (
            <button
              key={i}
              aria-label={`Page ${i + 1}`}
              aria-current={Number(params.get("page") || 1) === i + 1 ? "page" : undefined}
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
