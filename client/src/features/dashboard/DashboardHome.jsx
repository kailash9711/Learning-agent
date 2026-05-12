import { useSelector } from "react-redux";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { StatCard, StatCardSkeleton } from "./components/StatCard";
import { RecentActivity } from "./components/RecentActivity";

export default function DashboardHome() {
  const { user } = useSelector((s) => s.auth);
  const { loading, stats, activity } = useDashboardStats();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          {greeting()}, {user?.username ?? "Learner"}
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Here's what's happening with your studies today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s) => <StatCard key={s.id} {...s} />)}
      </div>

      {/* Recent activity */}
      <RecentActivity activity={activity} loading={loading} />
    </div>
  );
}
