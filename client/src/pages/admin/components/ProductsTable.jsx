export default function ProductsTable({ products, onDelete, onEdit }) {
  return (
    <section className="card mt-8 overflow-x-auto p-6">
      <h2 className="text-xl font-bold">Products and inventory</h2>
      <table className="mt-4 min-w-[760px] w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-3">Product</th><th>SKU</th><th>Category</th>
            <th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr className="border-b dark:border-slate-800" key={product._id}>
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <img src={product.images?.[0]?.url || "https://placehold.co/80"} alt="" className="h-12 w-10 rounded-lg object-cover" />
                  <span className="font-semibold">{product.name}</span>
                </div>
              </td>
              <td>{product.sku || "—"}</td>
              <td>{product.category?.name || "—"}</td>
              <td>₹{product.price.toLocaleString("en-IN")}</td>
              <td className={product.stock <= 5 ? "font-bold text-red-600" : ""}>{product.stock}</td>
              <td>{product.active === false ? "Hidden" : "Live"}</td>
              <td className="space-x-3">
                <button className="font-semibold text-blue-600" onClick={() => onEdit(product)}>Edit</button>
                <button className="font-semibold text-red-600" onClick={() => onDelete(product._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!products.length && <p className="py-8 text-center text-slate-500">No products yet. Use the form above to add the first one.</p>}
    </section>
  );
}
