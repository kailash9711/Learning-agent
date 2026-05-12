export default function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full animate-pulse">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-7 w-64 rounded bg-slate-200" />
        <div className="flex gap-3 mt-2">
          <div className="h-5 w-20 rounded-full bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-24 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="flex gap-4 border-b border-slate-100 pb-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-20 rounded bg-slate-100" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-100" />
    </div>
  );
}
