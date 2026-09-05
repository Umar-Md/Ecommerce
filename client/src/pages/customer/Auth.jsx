import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import toast from "react-hot-toast";
export default function Auth() {
  const loc = useLocation();
  const nav = useNavigate();
  const { api, login } = useApp();
  const isReg = loc.pathname === "/register";
  const [f, setF] = useState({ name: "", email: "", phone: "", identifier: "", password: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.post(isReg ? "/auth/register" : "/auth/login", isReg
        ? { name: f.name, email: f.email, phone: f.phone, password: f.password }
        : { identifier: f.identifier, password: f.password });
      login(r.data.user, r.data.token);
      toast.success(isReg ? "Account created" : "Welcome back");
      nav(r.data.user?.role === "admin" ? "/admin" : "/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={submit} className="card w-full max-w-md p-7">
        <h1 className="text-3xl font-extrabold">
          {isReg ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isReg ? "Join TechCommerce today." : "Sign in to continue shopping."}
        </p>
        {isReg && (
          <input
            className="input mt-6"
            placeholder="Full name"
            required
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        )}
        <input
          className="input mt-3"
          type={isReg ? "email" : "text"}
          placeholder={isReg ? "Email address" : "Email or mobile number"}
          aria-label={isReg ? "Email address" : "Email or mobile number"}
          autoComplete={isReg ? "email" : "username"}
          required
          value={isReg ? f.email : f.identifier}
          onChange={(e) => setF({ ...f, [isReg ? "email" : "identifier"]: e.target.value })}
        />
        {isReg && (
          <>
            <input className="input mt-3" type="tel" autoComplete="tel" aria-label="Mobile number" placeholder="Mobile number" required maxLength={25} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
            <p className="mt-1 text-xs text-slate-500">Enter your 10-digit Indian mobile number, optionally with +91.</p>
          </>
        )}
        <input
          className="input mt-3"
          type="password"
          autoComplete={isReg ? "new-password" : "current-password"}
          placeholder="Password"
          required
          minLength="8"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <button disabled={busy} className="btn-primary mt-5 w-full">
          {busy ? "Please wait..." : isReg ? "Create account" : "Sign in"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          {isReg ? "Already have an account?" : "New to TechCommerce?"}{" "}
          <Link
            className="font-bold underline"
            to={isReg ? "/login" : "/register"}
          >
            {isReg ? "Sign in" : "Create one"}
          </Link>
        </p>
      </form>
    </main>
  );
}
