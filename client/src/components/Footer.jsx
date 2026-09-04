import { useApp } from "../context/AppContext";

export default function Footer() {
  const { user } = useApp();
  if (user?.role === "admin") return null;
  return <footer className="mt-20 border-t">
    <div className="container-x grid gap-10 py-14 md:grid-cols-3">
      <div><div className="text-2xl font-extrabold">TechCommerce</div><p className="mt-3 max-w-sm text-sm text-slate-500">Thoughtful products, premium design and a shopping experience built for modern India.</p></div>
      <div><h3 className="font-bold">Shop</h3><p className="mt-3 text-sm leading-7 text-slate-500">New arrivals<br />Best sellers<br />Deals<br />Collections</p></div>
      <div><h3 className="font-bold">Support</h3><p className="mt-3 text-sm leading-7 text-slate-500">Contact us<br />Shipping<br />Returns<br />FAQs</p></div>
    </div>
    <div className="border-t py-5 text-center text-xs text-slate-500">© 2026 TechCommerce. All rights reserved.</div>
  </footer>;
}
