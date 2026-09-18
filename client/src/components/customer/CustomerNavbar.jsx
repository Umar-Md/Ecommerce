import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, Menu, Moon, Search, ShoppingBag, Sun, User, X, Sparkles, ChevronDown } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function CustomerNavbar() {
  const { user, cart, wishlist, theme, setTheme, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  
  const close = () => {
    setOpen(false);
    setUserDropdown(false);
  };

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

  const totalCartCount = cart?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <>
      {/* Top Announcement Bar with Glow Effect */}
      <div className="relative overflow-hidden bg-slate-950 text-white px-4 py-2 text-center text-xs font-semibold tracking-wider border-b border-amber-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/20 to-amber-500/10 animate-pulse pointer-events-none" />
        <span className="relative z-10 inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Free shipping on orders over ₹1,999 • 100% Secure Checkout</span>
        </span>
      </div>

      {/* Floating Island Header Container */}
      <header className="sticky top-3 z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto my-2">
        <div className="relative rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-slate-900/5 dark:shadow-none transition-all duration-300">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
            
            {/* Mobile Menu Toggle Button */}
            <button
              aria-label="Toggle navigation"
              className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Brand Logo with Glowing Symbol */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                T
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                TechCommerce<span className="text-amber-500">.</span>
              </span>
            </Link>

            {/* Search Input with Gradient Focus Glow */}
            <form onSubmit={search} className="hidden flex-1 md:block max-w-md mx-4">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                <input
                  aria-label="Search products"
                  className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products, categories, or brands..."
                />
              </div>
            </form>

            {/* Center Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Link to="/products" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                Shop
              </Link>
              <Link to="/products?sort=newest" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                New
              </Link>
              <Link to="/products?discount=true" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <span>Deals</span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  SALE
                </span>
              </Link>
            </nav>

            {/* Right Action Icons & User Dropdown */}
            <div className="flex items-center gap-2">
              {/* Theme Switcher */}
              <button
                aria-label="Toggle color theme"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Wishlist Link */}
              <Link
                aria-label="Wishlist"
                className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                to="/wishlist"
              >
                <Heart className="h-4 w-4" />
                {wishlist?.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white shadow-lg shadow-rose-500/30">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Link */}
              <Link
                aria-label="Cart"
                className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                to="/cart"
              >
                <ShoppingBag className="h-4 w-4" />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white shadow-lg shadow-amber-500/30">
                    {totalCartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown Menu */}
              {user ? (
                <div className="relative hidden md:block ml-1">
                  <button
                    onClick={() => setUserDropdown((prev) => !prev)}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-1.5 pr-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-amber-500/50 transition-all"
                  >
                    <div className="h-7 w-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                      {user.name?.[0]?.toUpperCase() || <User className="h-3.5 w-3.5" />}
                    </div>
                    <span className="max-w-[90px] truncate">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Card */}
                  {userDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 z-50">
                      <Link
                        to="/account"
                        onClick={close}
                        className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="h-4 w-4 text-amber-500" />
                        My Account
                      </Link>
                      <button
                        onClick={logOut}
                        className="w-full flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden md:inline-flex items-center rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold hover:bg-amber-500 dark:hover:bg-amber-400 hover:text-white transition-all shadow-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {open && (
            <div className="border-t border-slate-100 dark:border-slate-800 p-4 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-b-3xl animate-in slide-in-from-top-2">
              <form onSubmit={search} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products..."
                  />
                </div>
              </form>

              <nav className="flex flex-col gap-1 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <Link
                  to="/products"
                  onClick={close}
                  className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Shop Products
                </Link>
                <Link
                  to="/products?sort=newest"
                  onClick={close}
                  className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  New Arrivals
                </Link>
                <Link
                  to="/products?discount=true"
                  onClick={close}
                  className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <span>Deals</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-500">
                    Hot
                  </span>
                </Link>

                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />

                {user ? (
                  <>
                    <Link
                      to="/account"
                      onClick={close}
                      className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-amber-500" />
                      <span>Account ({user.name})</span>
                    </Link>
                    <button
                      className="w-full text-left p-3 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2"
                      onClick={logOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={close}
                    className="p-3 text-center rounded-2xl bg-amber-500 text-white font-bold shadow-lg shadow-amber-500/20"
                  >
                    Login / Register
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
} 