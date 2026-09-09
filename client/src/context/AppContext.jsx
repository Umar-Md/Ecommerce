import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import useAccountCart from "./useAccountCart";

const AppContext = createContext(null);
const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { localStorage.removeItem(key); return fallback; }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => localStorage.getItem("token") ? readJSON("user", null) : null);
  const authSession = useRef(0);
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem("token")));
  const [cart, setCart] = useAccountCart(user);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const wishlistLock = useRef(false);
  const wishlistSession = useRef(0);
  useEffect(() => {
    const session = ++wishlistSession.current;
    setWishlist([]);
    if (!user || authLoading || user.role === "admin") { setWishlistLoading(false); return; }
    setWishlistLoading(true);
    api.get("/wishlist")
      .then(({ data }) => { if (session === wishlistSession.current) setWishlist((data.products || []).filter(Boolean)); })
      .catch((error) => { if (session === wishlistSession.current) toast.error(error.response?.data?.message || "Could not load wishlist"); })
      .finally(() => { if (session === wishlistSession.current) setWishlistLoading(false); });
    return () => { wishlistSession.current++; };
  }, [user, authLoading]);
  const toggleWishlist = async (product) => {
    if (!user) return toast.error("Sign in to use your wishlist");
    if (wishlistLock.current || wishlistLoading) return;
    wishlistLock.current = true;
    setWishlistBusy(true);
    const session = wishlistSession.current;
    const saved = wishlist.some((item) => item._id === product._id);
    try {
      const { data } = saved
        ? await api.delete(`/wishlist/${product._id}`)
        : await api.post("/wishlist", { productId: product._id });
      if (session === wishlistSession.current) {
        setWishlist((data.products || []).filter(Boolean));
        toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
      }
    } catch (error) {
      if (session === wishlistSession.current) toast.error(error.response?.data?.message || "Could not update wishlist");
    } finally { wishlistLock.current = false; setWishlistBusy(false); }
  };
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const refreshSession = () => {
      const session = ++authSession.current;
      const token = localStorage.getItem("token");
      const isCurrent = () => session === authSession.current && token === localStorage.getItem("token");
      setUser(token ? readJSON("user", null) : null);
      setAuthLoading(Boolean(token));
      if (!token) return;
      api.get("/auth/me")
        .then(({ data }) => {
          if (!isCurrent()) return;
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        })
        .catch(() => {
          if (!isCurrent()) return;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => { if (session === authSession.current) setAuthLoading(false); });
    };
    const onStorage = (event) => {
      if (event.storageArea === localStorage && (event.key === "token" || event.key === null)) refreshSession();
    };
    refreshSession();
    window.addEventListener("storage", onStorage);
    return () => { authSession.current++; window.removeEventListener("storage", onStorage); };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const addToCart = (product, quantity = 1) => setCart((current) => {
    if (!product?._id || product.stock <= 0) return current;
    const requested = Math.max(1, Number(quantity) || 1);
    const index = current.findIndex((item) => item.product?._id === product._id);
    if (index < 0) return [...current, { product, quantity: Math.min(requested, product.stock) }];
    const next = [...current];
    next[index] = { ...next[index], quantity: Math.min(next[index].quantity + requested, product.stock) };
    return next;
  });
  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.product?._id !== id));
  const updateQty = (id, quantity) => setCart((current) => {
    const requested = Number(quantity);
    if (!Number.isInteger(requested)) return current;
    if (requested <= 0) return current.filter((item) => item.product?._id !== id);
    return current.map((item) => item.product?._id === id
      ? { ...item, quantity: Math.min(requested, item.product.stock || 1) } : item);
  });
  const clearCart = () => setCart([]);
  const login = (nextUser, token) => {
    authSession.current++;
    setAuthLoading(false);
    localStorage.setItem("user", JSON.stringify(nextUser)); localStorage.setItem("token", token); setUser(nextUser);
  };
  const logout = () => {
    authSession.current++;
    setAuthLoading(false);
    localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null);
  };
  const value = useMemo(() => ({ wishlist, wishlistLoading, wishlistBusy, toggleWishlist, user, authLoading, cart, theme, setTheme, addToCart, removeFromCart, updateQty, clearCart, login, logout, api }), [user, authLoading, cart, theme, wishlist, wishlistLoading, wishlistBusy]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
