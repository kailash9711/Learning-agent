import { FileText, ExternalLink } from "lucide-react";

export default function ContentTab({ doc }) {
  const filePath = doc?.filePath;
  const title = doc?.title ?? "Document";

  return (
    <div className="flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <span className="text-sm font-medium text-slate-600">Document Viewer</span>
        {filePath ? (
          <a
            href={filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
        ) : null}
      </div>

      <div className="relative w-full bg-slate-800" style={{ minHeight: "640px" }}>
        {filePath ? (
          <iframe
            src={filePath}
            title={title}
            className="w-full h-full absolute inset-0"
            style={{ minHeight: "640px", border: "none" }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-80 gap-3">
            <FileText className="h-10 w-10 text-slate-500" />
            <p className="text-sm text-slate-400">No file available to preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
