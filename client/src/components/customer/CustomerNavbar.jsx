import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, Menu, Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function CustomerNavbar() {
  const { user, cart, wishlist, theme, setTheme, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const search = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    close();
  };

  const logOut = () => {
    logout();
    close();
    navigate("/auth");
  };

  return (
    <>
      <div className="bg-slate-900 px-4 py-2 text-center text-xs font-medium text-white">
        Free shipping on orders over ₹1,999 • Easy 7-day returns
      </div>
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="container-x flex h-16 items-center gap-4">
          <button aria-label="Toggle navigation" className="md:hidden" onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
          <Link to="/" className="text-2xl font-extrabold tracking-tight">
            TechCommerce<span className="text-slate-400">.</span>
          </Link>
          <form onSubmit={search} className="hidden flex-1 md:block">
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
              <input aria-label="Search products" className="input pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands, categories..." />
            </div>
          </form>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            <Link to="/products">Shop</Link>
            <Link to="/products?sort=newest">New</Link>
            <Link to="/products?discount=true">Deals</Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <button aria-label="Toggle color theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="text-slate-600 dark:text-slate-300">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link aria-label="Wishlist" className="relative" to="/wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{wishlist.length}</span>}
            </Link>
            <Link aria-label="Cart" className="relative" to="/cart">
              <ShoppingBag className="h-5 w-5" />
              {cart.length > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>}
            </Link>
            {user ? (
              <div className="hidden items-center gap-3 lg:flex">
                <Link to="/account" className="flex items-center gap-1.5 text-sm font-medium"><User className="h-5 w-5" /><span>{user.name}</span></Link>
                <button aria-label="Log out" onClick={logOut}><LogOut className="h-5 w-5 text-slate-500" /></button>
              </div>
            ) : <Link to="/auth" className="hidden text-sm font-semibold lg:block">Login</Link>}
          </div>
        </div>

        {open && (
          <div className="container-x border-t py-4 md:hidden">
            <form onSubmit={search}>
              <input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." />
            </form>
            <nav className="mt-4 flex flex-col gap-3 font-medium">
              <Link to="/products" onClick={close}>Shop</Link>
              <Link to="/products?sort=newest" onClick={close}>New arrivals</Link>
              <Link to="/products?discount=true" onClick={close}>Deals</Link>
              {user && <Link to="/account" onClick={close}>My account</Link>}
              {user ? <button className="text-left text-red-500" onClick={logOut}>Logout</button> : <Link to="/auth" onClick={close}>Login / Register</Link>}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
