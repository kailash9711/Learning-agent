import { useState } from "react";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "performance", label: "Performance" },
  { id: "schedule", label: "Schedule" },
];

/* ── Overview tab ── */
function OverviewTab({ data }) {
  const items = [
    { label: "Weekly Goal", value: `${data?.weeklyGoal ?? 0}%` },
    { label: "Day Streak 🔥", value: `${data?.streak ?? 0} days` },
    { label: "Top Subject", value: data?.topSubject ?? "—" },
    { label: "Sessions This Week", value: data?.sessionsThisWeek ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center"
        >
          <p className="text-xl font-bold text-slate-800">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Performance tab ── */
function PerformanceTab({ data }) {
  const items = [
    { label: "Quiz Average", value: `${data?.quizAvg ?? 0}%`, accent: "text-violet-600" },
    { label: "Improvement", value: data?.improvement ?? "—", accent: "text-emerald-600" },
    { label: "Best Subject", value: data?.bestSubject ?? "—", accent: "text-blue-600" },
    { label: "Needs Work", value: data?.weakSubject ?? "—", accent: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(({ label, value, accent }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-center"
        >
          <p className={`text-xl font-bold ${accent}`}>{value}</p>
          <p className="mt-1 text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Schedule tab (simple bar chart) ── */
function ScheduleTab({ data = [] }) {
  const max = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="flex items-end gap-3 h-28">
      {data.map(({ day, minutes }) => {
        const pct = Math.round((minutes / max) * 100);
        return (
          <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500">{minutes}m</span>
            <div className="w-full rounded-t-md bg-violet-100 flex items-end" style={{ height: "80px" }}>
              <div
                className="w-full rounded-t-md bg-violet-500 transition-all duration-500"
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Skeleton ── */
function TabSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

/* ── Main export ── */
export function DashboardTabs({ tabData, loading }) {
  const [active, setActive] = useState("overview");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit mb-5">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={[
              "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              active === id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {loading ? (
        <TabSkeleton />
      ) : active === "overview" ? (
        <OverviewTab data={tabData.overview} />
      ) : active === "performance" ? (
        <PerformanceTab data={tabData.performance} />
      ) : (
        <ScheduleTab data={tabData.schedule} />
      )}
    </div>
  );
}
