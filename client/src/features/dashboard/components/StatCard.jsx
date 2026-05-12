import { FileText, Layers, HelpCircle, Clock, TrendingUp, TrendingDown } from "lucide-react";

const iconMap = {
  blue: { Icon: FileText, bg: "bg-blue-50", icon: "text-blue-500", ring: "ring-blue-100" },
  green: { Icon: Layers, bg: "bg-emerald-50", icon: "text-emerald-500", ring: "ring-emerald-100" },
  purple: { Icon: HelpCircle, bg: "bg-violet-50", icon: "text-violet-500", ring: "ring-violet-100" },
  orange: { Icon: Clock, bg: "bg-amber-50", icon: "text-amber-500", ring: "ring-amber-100" },
};



export function StatCard({ label, value, color }) {
  const { Icon, bg, icon, ring } = iconMap[color] ?? iconMap.blue;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-4 ${bg} ${ring}`}>
          <Icon className={`h-5 w-5 ${icon}`} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
      </div>
      <div className="space-y-2">
        <div className="h-6 w-20 rounded bg-slate-100" />
        <div className="h-3 w-28 rounded bg-slate-100" />
      </div>
    </div>
  );
}
