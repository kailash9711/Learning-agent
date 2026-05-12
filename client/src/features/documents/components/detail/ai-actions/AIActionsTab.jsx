import { useState } from "react";
import { MessageSquare, Wand2 } from "lucide-react";
import FormattedOutput from "../shared/FormattedOutput";

export default function AIActionsTab({ summary, conceptExplanation, actionLoading, onGenerateSummary, onExplainConcept }) {
  const [summaryFocus, setSummaryFocus] = useState("");
  const [concept, setConcept] = useState("");
  const [audience, setAudience] = useState("beginner");
  const [detailLevel, setDetailLevel] = useState("balanced");

  const canRunSummary = Boolean(onGenerateSummary) && actionLoading !== "summary";
  const canRunExplain = Boolean(onExplainConcept) && actionLoading !== "explain-concept";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <p className="text-sm font-semibold">Summary</p>
        </div>
        <p className="mt-2 text-xs leading-6 text-slate-500">Generate a concise overview of the current PDF and keep the result attached to this document.</p>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Optional focus
          <input
            value={summaryFocus}
            onChange={(event) => setSummaryFocus(event.target.value)}
            placeholder="Examples: main argument, definitions, formulas"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <button
          onClick={() => onGenerateSummary(summaryFocus.trim())}
          disabled={!canRunSummary}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {actionLoading === "summary" ? "Generating..." : "Generate summary"}
        </button>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          <FormattedOutput
            text={summary ? summary.summary ?? summary : ""}
            emptyText="Your summary will appear here after generation."
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <Wand2 className="h-4 w-4 text-emerald-500" />
          <p className="text-sm font-semibold">Explain concept</p>
        </div>
        <p className="mt-2 text-xs leading-6 text-slate-500">Ask for a focused explanation with a learner level and detail preference.</p>

        <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Concept
          <input
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
            placeholder="Example: photosynthesis"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Audience
            <select
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Detail level
            <select
              value={detailLevel}
              onChange={(event) => setDetailLevel(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="brief">brief</option>
              <option value="balanced">balanced</option>
              <option value="detailed">detailed</option>
            </select>
          </label>
        </div>

        <button
          onClick={() => onExplainConcept({ concept: concept.trim(), audience, detailLevel })}
          disabled={!canRunExplain || !concept.trim()}
          className="mt-4 w-full rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {actionLoading === "explain-concept" ? "Explaining..." : "Explain concept"}
        </button>

        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-slate-700">
          <FormattedOutput
            text={conceptExplanation ? conceptExplanation.explanation ?? conceptExplanation : ""}
            emptyText="Your explanation will appear here after generation."
          />
        </div>
      </section>
    </div>
  );
}
