import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AppContext = createContext(null);
const readJSON = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { localStorage.removeItem(key); return fallback; }
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => readJSON("user", null));
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem("token")));
  const [cart, setCart] = useState(() => readJSON("cart", []));
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (!localStorage.getItem("token")) { setAuthLoading(false); return; }
    api.get("/auth/me")
      .then(({ data }) => { setUser(data.user); localStorage.setItem("user", JSON.stringify(data.user)); })
      .catch(() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setUser(null); })
      .finally(() => setAuthLoading(false));
  }, []);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const addToCart = (product, quantity = 1) => setCart((current) => {
    if (!product?._id || product.stock <= 0) return current;
    const requested = Math.max(1, Number(quantity) || 1);
    const index = current.findIndex((item) => item.product?._id === product._id);
    if (index < 0) return [...current, { product, quantity: Math.min(requested, product.stock, 20) }];
    const next = [...current];
    next[index] = { ...next[index], quantity: Math.min(next[index].quantity + requested, product.stock, 20) };
    return next;
  });
  const removeFromCart = (id) => setCart((current) => current.filter((item) => item.product?._id !== id));
  const updateQty = (id, quantity) => setCart((current) => current.map((item) =>
    item.product?._id === id ? { ...item, quantity: Math.min(Math.max(1, Number(quantity) || 1), item.product.stock || 1, 20) } : item,
  ));
  const clearCart = () => setCart([]);
  const login = (nextUser, token) => {
    localStorage.setItem("user", JSON.stringify(nextUser)); localStorage.setItem("token", token); setUser(nextUser);
  };
  const logout = () => {
    localStorage.removeItem("user"); localStorage.removeItem("token"); setUser(null);
  };
  const value = useMemo(() => ({ user, authLoading, cart, theme, setTheme, addToCart, removeFromCart, updateQty, clearCart, login, logout, api }), [user, authLoading, cart, theme]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
};
