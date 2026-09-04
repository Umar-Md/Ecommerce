import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import CustomerRoute from "./components/CustomerRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Checkout from "./pages/Checkout";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <Routes>
        {/* PUBLIC ROUTES (Accessible by everyone) */}
        <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} />
        <Route path="/products" element={<CustomerRoute><Products /></CustomerRoute>} />
        <Route path="/products/:id" element={<CustomerRoute><ProductDetails /></CustomerRoute>} />
        <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
        <Route path="/wishlist" element={<CustomerRoute><Wishlist /></CustomerRoute>} />
        <Route path="/auth" element={<CustomerRoute><Auth /></CustomerRoute>} />
        <Route path="/login" element={<CustomerRoute><Auth /></CustomerRoute>} />
        <Route path="/register" element={<CustomerRoute><Auth /></CustomerRoute>} />

        {/* CUSTOMER PROTECTED ROUTES (Requires Login) */}
        <Route
          path="/account"
          element={
            <CustomerRoute requireAuth>
              <Account />
            </CustomerRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <CustomerRoute requireAuth>
              <Orders />
            </CustomerRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <CustomerRoute requireAuth>
              <OrderDetails />
            </CustomerRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <CustomerRoute requireAuth>
              <Checkout />
            </CustomerRoute>
          }
        />

        {/* ADMIN PROTECTED ROUTES (Requires Admin Role) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK 404 ROUTE */}
        <Route
          path="*"
          element={
            <main className="container-x py-20 text-center">
              <h1 className="text-4xl font-extrabold">404</h1>
              <p className="mt-2 text-slate-500">Page not found.</p>
            </main>
          }
        />
      </Routes>
      <Footer />
    </div>
  );
}
