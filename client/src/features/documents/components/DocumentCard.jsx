import { FileText, BookOpen, HelpCircle, Clock, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "../utils/formatTime";

const statusConfig = {
  ready: { dot: "bg-emerald-400", label: "Ready" },
  processing: { dot: "bg-amber-400 animate-pulse", label: "Processing…" },
  error: { dot: "bg-rose-400", label: "Error" },
};

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({ doc, onDelete }) {
  const { dot, label } = statusConfig[doc.status] ?? statusConfig.ready;
  const uploaded = formatDistanceToNow(doc.uploadedAt ?? doc.createdAt);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/documents/${doc._id}`)}
      className="group relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
    >
      {/* Delete button — stops propagation so card click isn't triggered */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(doc._id); }}
        aria-label="Delete document"
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 ring-4 ring-emerald-100">
        <FileText className="h-6 w-6 text-emerald-500" />
      </div>

      {/* Title & size */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate leading-snug" title={doc.title}>
          {doc.title}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">{formatBytes(doc.fileSize)}</p>
      </div>

      {/* Counts */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
          <BookOpen className="h-3.5 w-3.5" />
          {doc.flashcardCount ?? 0} Flashcards
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
          <HelpCircle className="h-3.5 w-3.5" />
          {doc.quizCount ?? 0} Quizzes
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {uploaded}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          {label}
        </span>
      </div>
    </div>
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-slate-100" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/4 rounded bg-slate-100" />
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-slate-100" />
        <div className="h-6 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="h-3 w-32 rounded bg-slate-100" />
    </div>
  );
}
