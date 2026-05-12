import { Link } from "react-router-dom";
import {
  CheckCircle2,
  BookOpen,
  Brain,
  Zap,
  FileText,
  Eye,
} from "lucide-react";

function ActivityItem({ title, subtitle, time, documentId }) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-slate-50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>
      <span className="shrink-0 text-xs text-slate-400">{time}</span>
      {documentId && (
        <Link
          to={`/documents/${documentId}`}
          className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100"
          title="View document"
        >
          <Eye className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function RecentActivity({ activity = [], loading = false }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-base font-semibold text-slate-800">Recent Activity</h2>

      {loading ? (
        <div className="space-y-3 mt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded bg-slate-100" />
                <div className="h-2.5 w-48 rounded bg-slate-100" />
              </div>
              <div className="h-2.5 w-12 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400 text-center py-6">No activity yet.</p>
      ) : (
        <div className="mt-1">
          {activity.map((item) => (
            <ActivityItem key={item.id} {...item} documentId={item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
