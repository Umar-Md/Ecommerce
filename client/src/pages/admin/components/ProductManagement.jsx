import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { EMPTY_PRODUCT, categoryValue } from "../constants";
import ProductForm from "./ProductForm";
import ProductsTable from "./ProductsTable";

export default function ProductManagement({ api, onMutation }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const productsResult = await api.get("/admin/products");
      setProducts(productsResult.data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load products");
    }
  }, [api]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_PRODUCT);
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        brandName: form.brand.trim(),
        brand: undefined,
        images: form.images.split(",").map((url) => url.trim()).filter(Boolean),
      };
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      toast.success(editingId ? "Product updated" : "Product created");
      resetForm();
      await loadProducts();
      onMutation();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save product");
    } finally {
      setBusy(false);
    }
  };

  const editProduct = (product) => {
    const variantValues = (name) => product.variants
      ?.find((variant) => variant.name.toLowerCase() === name)?.values?.join(", ") || "";
    setEditingId(product._id);
    setForm({
      name: product.name || "", sku: product.sku || "", description: product.description || "",
      price: product.price ?? "", originalPrice: product.originalPrice ?? "", stock: product.stock ?? "",
      category: categoryValue(product.category), brand: product.brand?.name || "",
      images: product.images?.map((image) => image?.url || image).filter(Boolean).join(", ") || "",
      sizes: variantValues("size"), colors: variantValues("color"),
      tags: product.tags?.join(", ") || "", featured: Boolean(product.featured), active: product.active !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently? Existing order snapshots will remain.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      await loadProducts();
      onMutation();
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete product");
    }
  };

  return (
    <>
      <ProductForm {...{ api, busy, editingId, form }} onCancel={resetForm} onChange={setForm} onSubmit={saveProduct} />
      <ProductsTable products={products} onDelete={deleteProduct} onEdit={editProduct} />
    </>
  );
}
