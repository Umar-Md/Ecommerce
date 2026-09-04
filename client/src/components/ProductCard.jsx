import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import toast from "react-hot-toast";
export default function ProductCard({ product }) {
  const { addToCart, api, user } = useApp();
  const add = () => {
    if (product.stock <= 0) return toast.error("This product is out of stock");
    addToCart(product);
    toast.success("Added to cart");
  };
  const addToWishlist = async () => {
    if (!user) return toast.error("Sign in to use your wishlist");
    try { await api.post("/wishlist", { productId: product._id }); toast.success("Saved to wishlist"); }
    catch (error) { toast.error(error.response?.data?.message || "Could not update wishlist"); }
  };
  return (
    <article className="group overflow-hidden rounded-2xl border bg-white dark:bg-slate-900">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link to={`/products/${product._id}`}>
          <img
            src={
              product.images?.[0]?.url ||
              product.images?.[0] ||
              "https://placehold.co/600x750"
            }
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <button aria-label={`Save ${product.name} to wishlist`} onClick={addToWishlist} className="absolute right-3 top-3 rounded-full bg-white/90 p-2">
          <Heart className="h-4 w-4" />
        </button>
        {product.discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
            -{product.discount}%
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {product.brand?.name || product.brand || "TechCommerce"}
        </p>
        <Link
          to={`/products/${product._id}`}
          className="line-clamp-2 font-semibold hover:underline"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-current" />
          {product.rating?.toFixed?.(1) || "4.8"}{" "}
          <span className="text-slate-400">({product.numReviews || 0})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-lg font-extrabold">
              ₹{product.price?.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <del className="ml-2 text-sm text-slate-400">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </del>
            )}
          </div>
          <button
            onClick={add}
            disabled={product.stock <= 0}
            aria-label={product.stock <= 0 ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
            className="rounded-xl bg-slate-900 p-2.5 text-white dark:bg-white dark:text-slate-900"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
