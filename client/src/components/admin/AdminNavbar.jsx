import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Moon, ShieldCheck, Sun, User, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function AdminNavbar() {
  const { user, theme, setTheme, logout } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const logOut = () => {
    logout();
    setOpen(false);
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#e0e5ec] text-slate-700 transition-colors duration-300 dark:bg-[#1e232a] dark:text-slate-300">
      <div className="container-x flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Left Side: Brand Logo & Admin Pill */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle admin navigation"
            className="rounded-xl p-2.5 transition-all active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] md:hidden shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38] dark:active:shadow-[inset_3px_3px_6px_#14171c,inset_-3px_-3px_6px_#282f38]"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link 
            to="/admin" 
            className="rounded-xl px-3 py-1.5 text-xl font-extrabold tracking-tight text-slate-800 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] transition-all hover:scale-[1.02] dark:text-slate-100 dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38]"
          >
            TechCommerce<span className="text-green-500">.</span>
          </Link>

          <nav className="hidden items-center md:flex">
            <Link
              to="/admin"
              className="ml-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-amber-700 shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] dark:text-amber-400 dark:shadow-[inset_2px_2px_4px_#14171c,inset_-2px_-2px_4px_#282f38]"
            >
              <ShieldCheck className="h-4 w-4 text-amber-500" /> Admin Workspace
            </Link>
          </nav>
        </div>

        {/* Right Side: Theme Toggle & User Info */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle color theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl p-2.5 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] transition-all active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38] dark:active:shadow-[inset_3px_3px_6px_#14171c,inset_-3px_-3px_6px_#282f38]"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] transition-all hover:text-slate-900 dark:text-slate-300 dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38] dark:hover:text-white"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#14171c,inset_-2px_-2px_4px_#282f38]">
                <User className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <span>{user?.name || "Admin"}</span>
            </Link>

            <button
              aria-label="Log out"
              onClick={logOut}
              className="rounded-xl p-2.5 text-slate-500 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] transition-all hover:text-red-500 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:text-slate-400 dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38] dark:hover:text-red-400 dark:active:shadow-[inset_3px_3px_6px_#14171c,inset_-3px_-3px_6px_#282f38]"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <nav className="border-t border-slate-300/40 bg-[#e0e5ec] px-4 py-4 md:hidden dark:border-slate-800/40 dark:bg-[#1e232a]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-xl p-3 shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#14171c,inset_-3px_-3px_6px_#282f38]">
              <User className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {user?.name || "Admin"}
              </span>
            </div>

            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl p-3 text-sm font-bold text-amber-600 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] dark:text-amber-400 dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38]"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin Workspace
            </Link>

            <button
              className="flex w-full items-center gap-2 rounded-xl p-3 text-left text-sm font-bold text-red-500 shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] dark:shadow-[5px_5px_10px_#14171c,-5px_-5px_10px_#282f38] dark:active:shadow-[inset_3px_3px_6px_#14171c,inset_-3px_-3px_6px_#282f38]"
              onClick={logOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}