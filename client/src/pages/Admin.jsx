import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";

const emptyProduct = {
  name: "", sku: "", description: "", price: "", originalPrice: "", stock: "",
  category: "", brand: "", images: "", sizes: "", colors: "", tags: "",
  featured: false, active: true,
};
const transitions = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function Field({ label, ...props }) {
  return <label className="text-sm font-semibold text-slate-700 dark:text-slate-200"><span className="mb-1.5 block">{label}</span><input className="input font-normal" {...props} /></label>;
}

export default function Admin() {
  const { api, user } = useApp();
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const setValue = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const load = useCallback(async () => {
    try {
      const [dashboardResponse, productResponse, orderResponse, categoryResponse, brandResponse] = await Promise.all([
        api.get("/admin/dashboard"), api.get("/admin/products"), api.get("/orders/admin/all"),
        api.get("/categories"), api.get("/brands"),
      ]);
      setDashboard(dashboardResponse.data);
      setProducts(productResponse.data.products || []);
      setOrders(orderResponse.data.orders || []);
      setCategories(categoryResponse.data || []);
      setBrands(brandResponse.data || []);
    } catch (error) { toast.error(error.response?.data?.message || "Could not load admin data"); }
  }, [api]);

  useEffect(() => { if (user?.role === "admin") load(); }, [user, load]);
  if (user?.role !== "admin") return <main className="container-x py-20 text-center">Admin access required.</main>;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, images: form.images.split(",").map((url) => url.trim()).filter(Boolean) };
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      toast.success(editingId ? "Product updated" : "Product created");
      setEditingId(null); setForm(emptyProduct); await load();
    } catch (error) { toast.error(error.response?.data?.message || "Could not save product"); }
    finally { setBusy(false); }
  };

  const edit = (product) => {
    const values = (name) => product.variants?.find((variant) => variant.name.toLowerCase() === name)?.values?.join(", ") || "";
    setEditingId(product._id);
    setForm({
      name: product.name || "", sku: product.sku || "", description: product.description || "",
      price: product.price ?? "", originalPrice: product.originalPrice ?? "", stock: product.stock ?? "",
      category: product.category?._id || "", brand: product.brand?._id || "",
      images: product.images?.map((image) => image.url).join(", ") || "",
      sizes: values("size"), colors: values("color"), tags: product.tags?.join(", ") || "",
      featured: Boolean(product.featured), active: product.active !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this product permanently? Existing order snapshots will remain.")) return;
    try { await api.delete(`/products/${id}`); toast.success("Product deleted"); await load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not delete product"); }
  };
  const updateStatus = async (id, status) => {
    try { await api.patch(`/orders/admin/${id}/status`, { status }); toast.success("Order status updated"); await load(); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update order"); }
  };
  const previews = form.images.split(",").map((url) => url.trim()).filter(Boolean);

  return <main className="container-x py-10">
    <p className="text-sm font-bold text-amber-600">VELORA ADMIN</p>
    <h1 className="text-4xl font-extrabold">Store management</h1>
    <p className="mt-2 text-slate-500">Manage catalog, inventory, product galleries, variants, and fulfillment.</p>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {[
        ["Revenue", `₹${(dashboard?.revenue || 0).toLocaleString("en-IN")}`],
        ["Orders", dashboard?.orders || 0], ["Customers", dashboard?.customers || 0],
        ["Products", dashboard?.products || 0], ["Pending", dashboard?.pendingOrders || 0],
      ].map(([label, value]) => <div className="card p-5" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold">{value}</p></div>)}
    </div>

    <form className="card mt-8 p-6" onSubmit={submit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold">{editingId ? "Edit product" : "Add a new product"}</h2><p className="text-sm text-slate-500">All pricing and stock values are validated again by the server.</p></div>
        {editingId && <button type="button" className="btn-soft" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Cancel editing</button>}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Product title *" required minLength="2" value={form.name} onChange={setValue("name")} placeholder="Classic linen shirt" />
        <Field label="SKU" value={form.sku} onChange={setValue("sku")} placeholder="VEL-SHIRT-001" />
        <label className="text-sm font-semibold md:col-span-2"><span className="mb-1.5 block">Description *</span><textarea className="input min-h-28 font-normal" required minLength="10" value={form.description} onChange={setValue("description")} placeholder="Describe materials, fit, care, and product details." /></label>
        <Field label="Retail price *" required type="number" min="0" step="0.01" value={form.price} onChange={setValue("price")} placeholder="1499" />
        <Field label="Original price" type="number" min="0" step="0.01" value={form.originalPrice} onChange={setValue("originalPrice")} placeholder="1999" />
        <Field label="Stock quantity *" required type="number" min="0" step="1" value={form.stock} onChange={setValue("stock")} placeholder="50" />
        <Field label="Sizes" value={form.sizes} onChange={setValue("sizes")} placeholder="S, M, L, XL" />
        <Field label="Colors" value={form.colors} onChange={setValue("colors")} placeholder="Black, White, Navy" />
        <Field label="Search tags" value={form.tags} onChange={setValue("tags")} placeholder="linen, summer, shirt" />
        <label className="text-sm font-semibold"><span className="mb-1.5 block">Category *</span><select className="input font-normal" required value={form.category} onChange={setValue("category")}><option value="">Select category</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <label className="text-sm font-semibold"><span className="mb-1.5 block">Brand *</span><select className="input font-normal" required value={form.brand} onChange={setValue("brand")}><option value="">Select brand</option>{brands.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label>
        <Field label="Image gallery URLs *" required value={form.images} onChange={setValue("images")} placeholder="https://.../front.jpg, https://.../back.jpg" />
        <div className="flex flex-wrap items-center gap-6 md:col-span-2">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured product</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Visible in store</label>
        </div>
      </div>
      {previews.length > 0 && <div className="mt-5"><p className="mb-2 text-sm font-semibold">Gallery preview</p><div className="flex gap-3 overflow-x-auto">{previews.map((url, index) => <img key={url + index} src={url} alt={`Product preview ${index + 1}`} className="h-28 w-24 rounded-xl border object-cover" />)}</div></div>}
      <button disabled={busy} className="btn-primary mt-6">{busy ? "Saving product..." : editingId ? "Save changes" : "Add product"}</button>
    </form>

    <section className="card mt-8 overflow-x-auto p-6">
      <h2 className="text-xl font-bold">Products and inventory</h2>
      <table className="mt-4 min-w-[760px] w-full text-left text-sm">
        <thead><tr className="border-b"><th className="py-3">Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead>
        <tbody>{products.map((product) => <tr className="border-b dark:border-slate-800" key={product._id}>
          <td className="py-3"><div className="flex items-center gap-3"><img src={product.images?.[0]?.url || "https://placehold.co/80"} alt="" className="h-12 w-10 rounded-lg object-cover" /><span className="font-semibold">{product.name}</span></div></td>
          <td>{product.sku || "—"}</td><td>{product.category?.name || "—"}</td><td>₹{product.price.toLocaleString("en-IN")}</td>
          <td className={product.stock <= 5 ? "font-bold text-red-600" : ""}>{product.stock}</td><td>{product.active === false ? "Hidden" : "Live"}</td>
          <td className="space-x-3"><button className="font-semibold text-blue-600" onClick={() => edit(product)}>Edit</button><button className="font-semibold text-red-600" onClick={() => remove(product._id)}>Delete</button></td>
        </tr>)}</tbody>
      </table>
      {!products.length && <p className="py-8 text-center text-slate-500">No products yet. Use the form above to add the first one.</p>}
    </section>

    <section className="card mt-8 overflow-x-auto p-6">
      <h2 className="text-xl font-bold">Customer orders</h2>
      <table className="mt-4 min-w-[680px] w-full text-left text-sm">
        <thead><tr className="border-b"><th className="py-3">Order</th><th>Customer</th><th>Total</th><th>Current status</th><th>Next action</th></tr></thead>
        <tbody>{orders.map((order) => <tr className="border-b dark:border-slate-800" key={order._id}><td className="py-3 font-mono">{order._id.slice(-8).toUpperCase()}</td><td>{order.user?.name || "Unknown"}</td><td>₹{order.total?.toLocaleString("en-IN")}</td><td>{order.status}</td><td><select aria-label={`Update order ${order._id} status`} className="input w-auto" value="" disabled={!transitions[order.status]?.length} onChange={(event) => updateStatus(order._id, event.target.value)}><option value="">Select action</option>{transitions[order.status]?.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody>
      </table>
    </section>
  </main>;
}
