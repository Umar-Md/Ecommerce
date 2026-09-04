import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Field from "./Field";

export default function ProductForm({
  api,
  brands,
  busy,
  categories,
  editingId,
  form,
  onCancel,
  onChange,
  onSubmit,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const setValue = (key) => (event) =>
    onChange((current) => ({ ...current, [key]: event.target.value }));

  // Convert image URL string into an array of URLs/Base64 strings
  const previews = form.images
    ? form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  // Upload files first so products store short, reusable URLs instead of Base64 data.
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (previews.length + files.length > 5) {
      toast.error("A product can have up to 5 images");
      event.target.value = "";
      return;
    }

    const data = new FormData();
    files.forEach((file) => data.append("images", file));
    setUploading(true);
    try {
      const response = await api.post("/upload", data);
      onChange((current) => ({
        ...current,
        images: [...previews, ...(response.data.urls || [])].join(", "),
      }));
      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not upload images");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Remove individual preview image
  const removeImage = (indexToRemove) => {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    onChange((current) => ({ ...current, images: updatedPreviews.join(", ") }));
  };

  return (
    <form className="card mt-8 p-6" onSubmit={onSubmit}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">
            {editingId ? "Edit product" : "Add a new product"}
          </h2>
          <p className="text-sm text-slate-500">
            All pricing and stock values are validated again by the server.
          </p>
        </div>
        {editingId && (
          <button type="button" className="btn-soft" onClick={onCancel}>
            Cancel editing
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field
          label="Product title *"
          required
          minLength="2"
          value={form.name}
          onChange={setValue("name")}
          placeholder="Classic linen shirt"
        />
        <Field
          label="SKU"
          value={form.sku}
          onChange={setValue("sku")}
          placeholder="VEL-SHIRT-001"
        />
        <label className="text-sm font-semibold md:col-span-2">
          <span className="mb-1.5 block">Description *</span>
          <textarea
            className="input min-h-28 font-normal"
            required
            minLength="10"
            value={form.description}
            onChange={setValue("description")}
            placeholder="Describe materials, fit, care, and product details."
          />
        </label>
        <Field
          label="Retail price *"
          required
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={setValue("price")}
          placeholder="1499"
        />
        <Field
          label="Original price"
          type="number"
          min="0"
          step="0.01"
          value={form.originalPrice}
          onChange={setValue("originalPrice")}
          placeholder="1999"
        />
        <Field
          label="Stock quantity *"
          required
          type="number"
          min="0"
          step="1"
          value={form.stock}
          onChange={setValue("stock")}
          placeholder="50"
        />
        <Field
          label="Sizes"
          value={form.sizes}
          onChange={setValue("sizes")}
          placeholder="S, M, L, XL"
        />
        <Field
          label="Colors"
          value={form.colors}
          onChange={setValue("colors")}
          placeholder="Black, White, Navy"
        />
        <Field
          label="Search tags"
          value={form.tags}
          onChange={setValue("tags")}
          placeholder="linen, summer, shirt"
        />
        <SelectField
          label="Category *"
          value={form.category}
          onChange={setValue("category")}
          items={categories}
          placeholder="Select category"
        />
        <SelectField
          label="Brand *"
          value={form.brand}
          onChange={setValue("brand")}
          items={brands}
          placeholder="Select brand"
        />

        {/* IMAGE UPLOAD & URL FIELD */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-sm font-semibold block">
            Product Images *
          </label>
          
          {/* File Picker Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-900/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {uploading ? "Uploading images..." : "Click to upload image files from your computer"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports PNG, JPG, WEBP (Multiple files allowed)
            </p>
          </div>

          {/* Or enter direct URLs */}
          <Field
            label="Or paste direct image URLs (comma-separated)"
            required={previews.length === 0}
            value={form.images}
            onChange={setValue("images")}
            placeholder="https://.../front.jpg, https://.../back.jpg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-6 md:col-span-2">
          <Checkbox
            label="Featured product"
            checked={form.featured}
            onChange={(checked) => onChange((prev) => ({ ...prev, featured: checked }))}
          />
          <Checkbox
            label="Visible in store"
            checked={form.active}
            onChange={(checked) => onChange((prev) => ({ ...prev, active: checked }))}
          />
        </div>
      </div>

      {/* GALLERY PREVIEW WITH REMOVE BUTTON */}
      {previews.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold">Gallery preview ({previews.length})</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {previews.map((url, index) => (
              <div key={index} className="relative group flex-shrink-0">
                <img
                  src={url}
                  alt={`Product preview ${index + 1}`}
                  className="h-28 w-24 rounded-xl border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button disabled={busy || uploading} className="btn-primary mt-6">
        {busy
          ? "Saving product..."
          : editingId
            ? "Save changes"
            : "Add product"}
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
        {items.map((item) => (
          <option key={item._id} value={item._id}>
            {item.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({ checked, label, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="rounded"
      />{" "}
      {label}
    </label>
  );
}
