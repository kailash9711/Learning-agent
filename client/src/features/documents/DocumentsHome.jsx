import { useState } from "react";
import { Plus, Search, FileText, AlertCircle } from "lucide-react";
import { useDocuments } from "./hooks/useDocuments";
import { DocumentCard, DocumentCardSkeleton } from "./components/DocumentCard";
import { UploadModal } from "./components/UploadModal";

export default function DocumentsHome() {
  const { documents, loading, uploading, error, uploadDocument, deleteDocument } =
    useDocuments();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const filtered = documents.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => setConfirmId(id);

  const confirmDelete = async () => {
    if (!confirmId) return;
    await deleteDocument(confirmId);
    setConfirmId(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage and organize your learning materials
          </p>
        </div>

        <button
          id="upload-document-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          id="document-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Document grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasSearch={search.length > 0} onUpload={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((doc) => (
            <DocumentCard key={doc._id} doc={doc} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <UploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={uploadDocument}
        uploading={uploading}
      />

      {/* Delete confirm dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 flex flex-col gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
              <FileText className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Delete this document?</p>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently remove the document and all associated flashcards and quizzes.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-medium text-white hover:bg-rose-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ hasSearch, onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
        <FileText className="h-7 w-7 text-emerald-400" />
      </div>
      {hasSearch ? (
        <>
          <p className="text-sm font-semibold text-slate-700">No documents match your search</p>
          <p className="text-xs text-slate-400">Try different keywords</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-slate-700">No documents yet</p>
          <p className="text-xs text-slate-400">Upload your first PDF to get started</p>
          <button
            onClick={onUpload}
            className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </button>
        </>
      )}
    </div>
  );
}
