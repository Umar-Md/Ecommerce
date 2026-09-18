import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Field from "./Field";
import { PRODUCT_CATEGORIES, PRODUCT_SIZES } from "../constants";
import ProductPreview3D from "./ProductPreview3D";

export default function ProductForm({
  api,
  busy,
  editingId,
  form,
  onCancel,
  onChange,
  onSubmit,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const setValue = (key) => (event) =>
    onChange((current) => ({ ...current, [key]: event.target.value }));

  // Convert image URL string into an array of URLs
  const previews = form.images
    ? form.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  const processUpload = async (filesArray) => {
    const files = Array.from(filesArray || []);
    if (!files.length) return;

    if (previews.length + files.length > 5) {
      toast.error("A product can have up to 5 images");
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = (event) => {
    processUpload(event.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    onChange((current) => ({ ...current, images: updatedPreviews.join(", ") }));
  };

  const selectedSizes = form.sizes
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  const availableSizes = [
    ...new Set([
      ...(PRODUCT_SIZES[form.category] || []),
      ...selectedSizes,
    ]),
  ];

  return (
    <form 
      className="card mt-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl shadow-slate-100/50 dark:shadow-none transition-all"
      onSubmit={onSubmit}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            {editingId && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                Editing
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All pricing and stock values are validated on the server.
          </p>
        </div>
        {editingId && (
          <button 
            type="button" 
            className="btn-soft text-sm font-medium px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            onClick={onCancel}
          >
            Cancel editing
          </button>
        )}
      </div>

      {/* Main Form Fields */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
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
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 md:col-span-2">
          <span className="mb-2 block">Description *</span>
          <textarea
            className="input min-h-28 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-3 text-sm font-normal text-slate-900 dark:text-slate-100 transition-colors focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            required
            minLength="10"
            value={form.description}
            onChange={setValue("description")}
            placeholder="Describe materials, fit, care instructions, and product details..."
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
        
        {/* Sizes Fieldset */}
        <fieldset className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sizes{form.category === "footwear" ? " (UK)" : ""}
          </legend>
          {!form.category ? (
            <p className="mt-1 text-xs text-slate-400">Select a category to enable available sizes.</p>
          ) : availableSizes.length === 0 ? (
            <p className="mt-1 text-xs text-slate-400">No predefined sizes for this category.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {availableSizes.map((size) => {
                const isChecked = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const updated = isChecked
                        ? selectedSizes.filter((val) => val !== size)
                        : [...selectedSizes, size];
                      onChange((current) => ({ ...current, sizes: updated.join(", ") }));
                    }}
                    className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      isChecked
                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

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
          onChange={(event) =>
            onChange((current) => ({ ...current, category: event.target.value, sizes: "" }))
          }
          items={PRODUCT_CATEGORIES}
          placeholder="Select category"
        />
        <Field
          required
          label="Brand *"
          value={form.brand}
          onChange={setValue("brand")}
          placeholder="Enter brand name"
        />

        {/* Image Upload & URL Dropzone */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Product Images *
            </label>
            <span className="text-xs text-slate-500">
              {previews.length} / 5 uploaded
            </span>
          </div>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 scale-[1.01]"
                : "border-slate-300 dark:border-slate-700 hover:border-amber-500/70 bg-slate-50/50 dark:bg-slate-900/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Uploading image files...
                </span>
              ) : (
                "Click or drag and drop images here"
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports PNG, JPG, WEBP • Max 5 images
            </p>
          </div>

          <Field
            label="Or paste direct image URLs (comma-separated)"
            required={previews.length === 0}
            value={form.images}
            onChange={setValue("images")}
            placeholder="https://.../front.jpg, https://.../back.jpg"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 md:col-span-2 pt-2">
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

      {/* Visual Previews Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start border-t border-slate-100 dark:border-slate-800 pt-6">
        <ProductPreview3D imageUrl={previews[0]} productName={form.name} />
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Gallery Preview
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {previews.length} / 5
            </span>
          </div>
          
          {previews.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3">
              {previews.map((url, index) => (
                <div key={index} className="group relative aspect-3/4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-sm">
                  <img
                    src={url}
                    alt={`Product preview ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {index === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 shadow-md transition-all hover:bg-red-600 hover:scale-110"
                    title="Remove image"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-950/30">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uploaded product gallery photos will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button 
          disabled={busy || uploading} 
          className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {busy || uploading ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {busy ? "Saving product..." : "Uploading..."}
            </span>
          ) : editingId ? (
            "Save Changes"
          ) : (
            "Add Product"
          )}
        </button>
      </div>
    </form>
  );
}

function SelectField({ items, label, placeholder, ...props }) {
  return (
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
      <span className="mb-1.5 block">{label}</span>
      <select 
        className="input font-normal w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-slate-100 transition-colors focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20" 
        required 
        {...props}
      >
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
    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500/20 transition-colors"
      />
      {label}
    </label>
  );
}