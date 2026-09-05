import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";

const fields = { fullName: "Full name", phone: "Phone", line1: "Street address", city: "City", state: "State", postalCode: "Postal code" };
const limits = { fullName: 100, phone: 30, line1: 300, city: 100, state: 100, postalCode: 20 };
const blank = (name = "") => ({ fullName: name, phone: "", line1: "", city: "", state: "", postalCode: "" });

export default function CheckoutAddress({ address, setAddress, disabled }) {
  const { api, user } = useApp();
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState("");
  const [label, setLabel] = useState("Home");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reload, setReload] = useState(0);
  const select = (item) => {
    setSelected(item?._id || "");
    setLabel(item?.label || "Home");
    setAddress(item ? Object.fromEntries(Object.keys(fields).map((key) => [key, item[key]])) : blank(user?.name));
  };
  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    setSaved([]);
    select(null);
    if (!user) { setLoading(false); return; }
    api.get("/addresses").then(({ data }) => {
      if (!active) return;
      setSaved(data.addresses);
      if (data.addresses.length) select(data.addresses[0]);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, api, reload]);

  const save = async () => {
    if (working) return;
    setWorking(true);
    try {
      const { data } = await api.post("/addresses", { ...address, label });
      setSaved((items) => [data, ...items]);
      select(data);
      toast.success("Address saved for future orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not save address");
    } finally { setWorking(false); }
  };
  const remove = async () => {
    if (working) return;
    setWorking(true);
    try {
      await api.delete(`/addresses/${selected}`);
      setSaved((items) => items.filter((item) => item._id !== selected));
      select(null);
      toast.success("Saved address removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not remove address");
    } finally { setWorking(false); }
  };

  return (
    <fieldset disabled={disabled || working || loading} className="mt-4 space-y-4">
      {loading && <p role="status">Loading saved addresses...</p>}
      {loadError && <p role="alert" className="text-sm">Could not load saved addresses. <button type="button" className="underline" onClick={() => setReload((value) => value + 1)}>Retry</button></p>}
      {!!saved.length && (
        <label className="block text-sm font-medium">
          Saved addresses
          <select className="input mt-2 w-full" value={selected} onChange={(event) => select(saved.find((item) => item._id === event.target.value))}>
            <option value="">Add a new address</option>
            {saved.map((item) => <option key={item._id} value={item._id}>{item.label} — {item.fullName}, {item.line1}, {item.city}</option>)}
          </select>
        </label>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {Object.entries(fields).map(([key, title]) => (
          <label key={key} className="text-sm">
            {title}
            <input className="input mt-1 w-full" required maxLength={limits[key]} type={key === "phone" ? "tel" : "text"} value={address[key]} onChange={(event) => { setSelected(""); setAddress({ ...address, [key]: event.target.value }); }} />
          </label>
        ))}
      </div>
      {user && (selected ? (
        <div className="flex flex-wrap gap-4 text-sm">
          <button type="button" className="underline" onClick={() => select(null)}>Add another address</button>
          <button type="button" className="underline" onClick={remove}>Remove saved address</button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm">Address label (e.g. Home or Work)
            <input className="input mt-1 w-full" maxLength={50} value={label} onChange={(event) => setLabel(event.target.value)} />
          </label>
          <button type="button" className="btn-primary" onClick={save}>{working ? "Saving..." : "Save address"}</button>
          <p className="text-xs text-slate-500">Save this address to reuse it on future orders.</p>
        </div>
      ))}
    </fieldset>
  );
}
