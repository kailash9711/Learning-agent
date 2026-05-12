import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

export default function ChatTab({ doc, messages, onSend, loading }) {
  const [draft, setDraft] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value || loading) return;
    await onSend(value);
    setDraft("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-3.5">
          <p className="text-sm font-semibold text-slate-800">Chat about {doc?.title ?? "this document"}</p>
          <p className="mt-1 text-xs text-slate-500">Ask focused questions from the extracted PDF context.</p>
        </div>

        <div className="max-h-105 min-h-75 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
              Ask your first question to start the conversation.
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={`${message.timestamp || index}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={[
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm",
                    message.role === "user"
                      ? "bg-slate-900 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-md",
                  ].join(" ")}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submit} className="border-t border-slate-100 p-3 flex items-end gap-2 bg-white">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a question from this document..."
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            disabled={loading || !draft.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-800">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <p className="text-sm font-semibold">Tips</p>
        </div>
        <ul className="mt-3 space-y-2 text-xs leading-6 text-slate-500">
          <li>Ask specific questions from one concept at a time.</li>
          <li>Request examples: "Give a real-world example".</li>
          <li>Ask to simplify: "Explain this in easy terms".</li>
          <li>Use follow-ups to deepen understanding quickly.</li>
        </ul>
      </div>
    </div>
  );
}
