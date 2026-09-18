import { Link } from "react-router-dom";
import { useState } from "react";
import CheckoutAddress from "../../components/CheckoutAddress";
import { useApp } from "../../context/AppContext";

export default function Account() {
  const { user } = useApp();
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [showAddresses, setShowAddresses] = useState(false);

  return (
    <main className="container-x py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Profile Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-2xl shadow-slate-900/20 dark:shadow-none border border-slate-800">
        {/* Background Visual Elements */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-12 h-48 w-48 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* User Avatar with Ring Glow */}
            <div className="relative flex-shrink-0">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="h-full w-full rounded-[14px] bg-slate-950 flex items-center justify-center font-black text-2xl text-amber-400">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active" />
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {user?.name || "Welcome back"}
                </h1>
                <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                  Member
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                {user?.email || "Account Management Hub"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 border border-white/10"
            >
              <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Quick Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Orders Card */}
        <Link
          to="/orders"
          className="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300"
        >
          {/* Subtle Hover Gradient Accent */}
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/5 blur-2xl group-hover:bg-amber-500/15 transition-colors" />

          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:bg-amber-500/10 transition-all">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Orders
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track packages, view recent purchases, or process cancellations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>View Order History</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>
        </Link>

        {/* Wishlist Card */}
        <Link
          to="/wishlist"
          className="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/60 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-rose-500/5 blur-2xl group-hover:bg-rose-500/15 transition-colors" />

          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-1.125-6.364 4.5 4.5 0 00-6.502 0L12 7.293l-1.055-1.037a4.5 4.5 0 00-6.627 0z" />
                </svg>
              </div>
              <span className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 group-hover:bg-rose-500/10 transition-all">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>

            <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Wishlist
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your saved favorites and price-tracked items for future buying.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span>Saved Products</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </div>
        </Link>

        {/* Profile Card */}
        <div className="relative overflow-hidden flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/60 p-6 shadow-sm">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl" />

          <div>
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Verified
              </span>
            </div>

            <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Profile Details
            </h2>

            <div className="mt-3 space-y-1.5">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || "No email provided"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.phone || "No phone linked"}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-xs font-medium text-slate-400">
            Account Preferences
          </div>
        </div>

        {/* Delivery Address Toggle Card */}
        <button
          type="button"
          aria-expanded={showAddresses}
          aria-controls="account-addresses"
          onClick={() => setShowAddresses((value) => !value)}
          className={`group text-left relative overflow-hidden flex flex-col justify-between rounded-3xl border p-6 shadow-sm transition-all duration-300 ${
            showAddresses
              ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10"
              : "border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/60 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1"
          }`}
        >
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/15 transition-colors" />

          <div>
            <div className="flex items-center justify-between">
              <div
                className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm ${
                  showAddresses
                    ? "bg-amber-500 text-white"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white"
                }`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              <span
                className={`h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform duration-300 ${
                  showAddresses
                    ? "rotate-180 bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:bg-blue-500/10"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>

            <h2 className="mt-6 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Addresses
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {showAddresses
                ? "Close form below to finish managing saved shipping addresses."
                : "Manage delivery addresses and setup default shipping details."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>{showAddresses ? "Hide Address Manager" : "Manage Delivery Addresses"}</span>
            <span>{showAddresses ? "▲" : "▼"}</span>
          </div>
        </button>
      </div>

      {/* Address Form Drawer Section */}
      {showAddresses && (
        <section
          id="account-addresses"
          className="mt-8 max-w-4xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Saved Addresses
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update primary shipping address details for smoother checkout
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddresses(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <CheckoutAddress address={address} setAddress={setAddress} />
        </section>
      )}
    </main>
  );
}