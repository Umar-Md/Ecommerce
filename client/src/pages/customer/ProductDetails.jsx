import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  RotateCcw,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function ProductDetails() {
  const { id } = useParams();
  const { api, addToCart, wishlist, wishlistLoading, wishlistBusy, toggleWishlist, user } = useApp();
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(0);
  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((r) => setP(r.data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load product"));
    api.get(`/reviews/${id}`)
      .then((r) => setReviews(r.data))
      .catch((error) => toast.error(error.response?.data?.message || "Could not load reviews"));
  }, [id]);
  if (!p) return <div className="container-x py-20">Loading product...</div>;
  const imgs = p.images?.map((x) => x.url || x) || [
    "https://placehold.co/800x1000",
  ];
  const add = () => {
    if (p.stock <= 0) return toast.error("This product is out of stock");
    addToCart(p, qty);
    toast.success("Added to cart");
  };
  const saved = wishlist.some((item) => item._id === p._id);
  const submitReview = async (event) => {
    event.preventDefault();
    if (!user) return toast.error("Sign in to leave a review");
    if (!rating || comment.trim().length < 3) return toast.error("Choose a rating and write at least 3 characters");
    setReviewSubmitting(true);
    try {
      await api.post(`/reviews/${p._id}`, { rating, comment: comment.trim() });
      const { data } = await api.get(`/reviews/${p._id}`);
      setReviews(data);
      setRating(0);
      setComment("");
      setP((current) => ({ ...current, rating: data.reduce((sum, review) => sum + review.rating, 0) / data.length, numReviews: data.length }));
      toast.success("Review added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not add review");
    } finally { setReviewSubmitting(false); }
  };
  return (
    <main className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3 md:grid-cols-[90px_1fr]">
          <div className="order-2 flex gap-2 overflow-auto md:order-1 md:flex-col">
            {imgs.map((x, i) => (
              <button
                key={x + i}
                onClick={() => setImage(i)}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border ${image === i ? "ring-2 ring-slate-900" : ""}`}
              >
                <img src={x} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 md:order-2">
            <img src={imgs[image]} className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="py-2">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {p.brand?.name || "TechCommerce"}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-5xl">{p.name}</h1>
          {p.numReviews > 0 ? <div className="mt-4 flex items-center gap-2">
            <Star className="h-5 w-5 fill-current" />
            {p.rating?.toFixed?.(1)}{" "}
            <span className="text-slate-400">({p.numReviews} reviews)</span>
          </div> : <p className="mt-4 text-slate-500">No ratings yet</p>}
          {p.stock <= 0 && <p className="mt-4 font-bold text-red-600" role="status">Out of stock</p>}
          {p.stock > 0 && p.stock < 5 && <p className="mt-4 font-bold text-amber-600" role="status">Hurry, only {p.stock} left!</p>}
          <div className="mt-6">
            <span className="text-3xl font-extrabold">
              ₹{p.price.toLocaleString("en-IN")}
            </span>
            {p.originalPrice > p.price && (
              <del className="ml-3 text-slate-400">
                ₹{p.originalPrice.toLocaleString("en-IN")}
              </del>
            )}
          </div>
          <p className="mt-6 leading-7 text-slate-600 dark:text-slate-300">
            {p.description}
          </p>
          <div className="my-7 h-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="font-bold">Quantity</span>
            <div className="mt-3 inline-flex items-center rounded-xl border">
              <button
                className="p-3"
                disabled={p.stock <= 0}
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                <Minus />
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button className="p-3" onClick={() => qty >= p.stock ? toast.error(`Only ${p.stock} available`) : setQty(Math.min(qty + 1, p.stock))}>
                <Plus />
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button disabled={p.stock <= 0} className="btn-primary py-4" onClick={add}>
              <ShoppingBag className="mr-2" /> Add to cart
            </button>
            <button className="btn-soft py-4" aria-pressed={saved} disabled={wishlistLoading || wishlistBusy} onClick={() => toggleWishlist(p)}>
              <Heart className={`mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} /> {saved ? "Remove from wishlist" : "Save to wishlist"}
            </button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <Truck />
              <div>
                <b>Fast delivery</b>
                <p className="text-sm text-slate-500">
                  Estimated 2–5 business days
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <RotateCcw />
              <div>
                <b>Easy returns</b>
                <p className="text-sm text-slate-500">7-day return window</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section className="mt-14 border-t pt-10">
        <h2 className="text-2xl font-extrabold">Ratings and reviews</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
          <div className="space-y-4">
            {reviews.length === 0 ? <p className="text-slate-500">No reviews yet. Be the first to review this product.</p> : reviews.map((review) => (
              <article key={review._id} className="rounded-2xl border p-5">
                <div className="flex items-center justify-between gap-4">
                  <b>{review.user?.name || "Customer"}</b>
                  <span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-current" /> {review.rating}/5</span>
                </div>
                <p className="mt-3 text-slate-600 dark:text-slate-300">{review.comment}</p>
              </article>
            ))}
          </div>
          <div className="rounded-2xl border p-5">
            <h3 className="font-bold">Leave a review</h3>
            {user ? <form className="mt-4 space-y-4" onSubmit={submitReview}>
              <div className="flex gap-1" aria-label="Choose a rating">
                {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`${value} star${value > 1 ? "s" : ""}`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star className={`h-6 w-6 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} /></button>)}
              </div>
              <textarea className="min-h-28 w-full rounded-xl border p-3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share your experience" maxLength={1000} />
              <button className="btn-primary w-full" disabled={reviewSubmitting}>{reviewSubmitting ? "Submitting..." : "Submit review"}</button>
            </form> : <p className="mt-3 text-sm text-slate-500">Sign in to rate and review this product.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
