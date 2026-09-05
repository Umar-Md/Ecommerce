import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import ProductCard from "../../components/ProductCard";

export default function Wishlist() {
  const { wishlist: items, wishlistLoading, user } = useApp();
  return (
    <main className="container-x py-10">
      <h1 className="text-4xl font-extrabold">Wishlist</h1>
      {!user ? (
        <div className="card mt-8 p-10 text-center">
          Sign in to manage your wishlist.
        </div>
      ) : wishlistLoading ? (
        <p className="mt-8" role="status">Loading wishlist...</p>
      ) : !items.length ? (
        <div className="card mt-8 p-10 text-center">
          <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
          <p className="mt-2 text-slate-500">Save products using the heart button.</p>
          <Link className="btn-primary mt-6" to="/products">Explore products</Link>
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
