export default function Loader() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border p-3">
          <div className="aspect-[4/5] rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 h-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
