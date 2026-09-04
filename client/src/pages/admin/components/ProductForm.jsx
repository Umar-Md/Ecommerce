import Field from "./Field";

export default function ProductForm({ brands, busy, categories, editingId, form, onCancel, onChange, onSubmit }) {
  const setValue = (key) => (event) => onChange((current) => ({ ...current, [key]: event.target.value }));
  const previews = form.images.split(",").map((url) => url.trim()).filter(Boolean);

  return (
    <form className="card mt-8 p-6" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{editingId ? "Edit product" : "Add a new product"}</h2>
          <p className="text-sm text-slate-500">All pricing and stock values are validated again by the server.</p>
        </div>
        {editingId && <button type="button" className="btn-soft" onClick={onCancel}>Cancel editing</button>}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Product title *" required minLength="2" value={form.name} onChange={setValue("name")} placeholder="Classic linen shirt" />
        <Field label="SKU" value={form.sku} onChange={setValue("sku")} placeholder="VEL-SHIRT-001" />
        <label className="text-sm font-semibold md:col-span-2">
          <span className="mb-1.5 block">Description *</span>
          <textarea className="input min-h-28 font-normal" required minLength="10" value={form.description} onChange={setValue("description")} placeholder="Describe materials, fit, care, and product details." />
        </label>
        <Field label="Retail price *" required type="number" min="0" step="0.01" value={form.price} onChange={setValue("price")} placeholder="1499" />
        <Field label="Original price" type="number" min="0" step="0.01" value={form.originalPrice} onChange={setValue("originalPrice")} placeholder="1999" />
        <Field label="Stock quantity *" required type="number" min="0" step="1" value={form.stock} onChange={setValue("stock")} placeholder="50" />
        <Field label="Sizes" value={form.sizes} onChange={setValue("sizes")} placeholder="S, M, L, XL" />
        <Field label="Colors" value={form.colors} onChange={setValue("colors")} placeholder="Black, White, Navy" />
        <Field label="Search tags" value={form.tags} onChange={setValue("tags")} placeholder="linen, summer, shirt" />
        <SelectField label="Category *" value={form.category} onChange={setValue("category")} items={categories} placeholder="Select category" />
        <SelectField label="Brand *" value={form.brand} onChange={setValue("brand")} items={brands} placeholder="Select brand" />
        <Field label="Image gallery URLs *" required value={form.images} onChange={setValue("images")} placeholder="https://.../front.jpg, https://.../back.jpg" />
        <div className="flex flex-wrap items-center gap-6 md:col-span-2">
          <Checkbox label="Featured product" checked={form.featured} onChange={(checked) => onChange({ ...form, featured: checked })} />
          <Checkbox label="Visible in store" checked={form.active} onChange={(checked) => onChange({ ...form, active: checked })} />
        </div>
      </div>

      {previews.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Gallery preview</p>
          <div className="flex gap-3 overflow-x-auto">
            {previews.map((url, index) => <img key={url + index} src={url} alt={`Product preview ${index + 1}`} className="h-28 w-24 rounded-xl border object-cover" />)}
          </div>
        </div>
      )}
      <button disabled={busy} className="btn-primary mt-6">
        {busy ? "Saving product..." : editingId ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}

function SelectField({ items, label, placeholder, ...props }) {
  return (
    <label className="text-sm font-semibold">
      <span className="mb-1.5 block">{label}</span>
      <select className="input font-normal" required {...props}>
        <option value="">{placeholder}</option>
        {items.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
      </select>
    </label>
  );
}

function Checkbox({ checked, label, onChange }) {
  return <label className="flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /> {label}</label>;
}
