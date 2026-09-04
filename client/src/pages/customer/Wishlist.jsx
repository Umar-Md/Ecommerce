import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import ProductCard from "../../components/ProductCard";
import toast from "react-hot-toast";
export default function Wishlist() {
  const { api, user } = useApp();
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (user) api.get("/wishlist").then((r) => setItems(r.data.products || [])).catch((error) => toast.error(error.response?.data?.message || "Could not load wishlist"));
  }, [user]);
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">Wishlist</h1>
      {!user ? (
        <div className="card mt-8 p-10 text-center">
          Sign in to manage your wishlist.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
