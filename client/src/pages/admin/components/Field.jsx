export default function Field({ label, ...props }) {
  return (
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span className="mb-1.5 block">{label}</span>
      <input className="input font-normal" {...props} />
    </label>
  );
}
