import { Link } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, BookOpen, Brain, CheckCircle2, Clock3, FileText, HelpCircle, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useProgressData } from "./hooks/useProgressData";
import Heatmap from "./components/Heatmap";
import PomodoroTimer from "../../shared/components/sidebar/PomodoroTimer";
import TodoWidget from "../../shared/components/sidebar/TodoWidget";
import PersonaSwitcher from "../../shared/components/sidebar/PersonaSwitcher";
import DailyConcept from "../../shared/components/sidebar/DailyConcept";

/**
 * Formats a timestamp into a readable date-time string
 * @param {string|Date} value - The timestamp to format
 * @returns {string} Formatted date string (e.g., "Apr 12, 04:13 AM") or "Recently"
 */
const formatTime = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * ProgressPage Component
 * Displays comprehensive study analytics including:
 * - Key metrics (documents, flashcard sets, quiz sets, accuracy)
 * - Weekly activity chart with 7-day history
 * - Recent study sets (virtualized, max 5 visible)
 * - Activity timeline (virtualized, max 10 visible)
 */
export default function ProgressPage() {
  const { loading, stats, recentSets, activity, weeklyBuckets, heatmapData } = useProgressData();
  
  // Track which items are displayed for pagination/virtualization
  const [visibleRecentCount] = useState(5); // Show max 5 recent sets
  const [visibleActivityCount] = useState(10); // Show max 10 activity items

  // Virtualize/paginate recent sets to show 5 items at a time
  const visibleRecentSets = useMemo(() => recentSets.slice(0, visibleRecentCount), [recentSets, visibleRecentCount]);
  const hasMoreRecent = recentSets.length > visibleRecentCount;

  // Virtualize/paginate activity items to show 10 at a time
  const visibleActivity = useMemo(() => activity.slice(0, visibleActivityCount), [activity, visibleActivityCount]);
  const hasMoreActivity = activity.length > visibleActivityCount;

  // Keep chart scale meaningful: round up to a clean step so bars and Y-axis values match.
  const yAxisMax = useMemo(() => {
    const peak = Math.max(...weeklyBuckets.map((item) => item.count), 0);
    // Use score-style baseline so bar height always maps to visible 0-100 axis.
    if (peak <= 100) return 100;
    const step = 25;
    return Math.ceil(peak / step) * step;
  }, [weeklyBuckets]);

  const yAxisTicks = useMemo(
    () => [yAxisMax, Math.round(yAxisMax * 0.75), Math.round(yAxisMax * 0.5), Math.round(yAxisMax * 0.25), 0],
    [yAxisMax]
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
      {/* Header Section - Professional & Minimalist Design */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Your Progress</h1>
        <p className="text-base text-slate-600">Monitor your learning journey with real-time analytics</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Documents</span>
            <FileText className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.documents}</p>
          <p className="mt-1 text-xs text-slate-500">{stats.readyDocuments} ready, {stats.processingDocuments} processing</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Flashcard Sets</span>
            <BookOpen className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.flashcardSets}</p>
          <p className="mt-1 text-xs text-slate-500">All generated sets included</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Quiz Sets</span>
            <HelpCircle className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.quizSets}</p>
          <p className="mt-1 text-xs text-slate-500">{stats.answered} answered questions</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Answer Accuracy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-900">{stats.accuracy}%</p>
          <p className="mt-1 text-xs text-slate-500">Based on submitted quiz answers</p>
        </div>
      </div>

      {/* Learning Heatmap */}
      <Heatmap data={heatmapData} />

      {/* Weekly Activity & Recent Study Sets Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Weekly Activity Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-5">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Weekly Activity</h2>
          </div>
          <div className="grid grid-cols-[2.5rem_1fr] gap-3">
            {/* Y-axis labels */}
            <div className="relative h-56">
              <div className="absolute inset-0 flex flex-col justify-between text-right">
                {yAxisTicks.map((tick) => (
                  <span key={tick} className="text-xs font-medium text-slate-500">
                    {tick}
                  </span>
                ))}
              </div>
            </div>

            {/* Chart frame */}
            <div className="relative h-56 overflow-hidden rounded-sm border-l border-b border-slate-300">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                <div className="border-t border-slate-200/80" />
                <div className="border-t border-slate-200/80" />
                <div className="border-t border-slate-200/80" />
                <div className="border-t border-slate-200/80" />
                <div />
              </div>

              {/* Vertical guide lines */}
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${weeklyBuckets.length}, minmax(0, 1fr))` }}>
                {weeklyBuckets.map(({ dateKey }) => (
                  <div key={dateKey} className="border-l border-dashed border-slate-200/70" />
                ))}
              </div>

              {/* Bars scaled to axis values */}
              <div className="absolute inset-0 flex items-end gap-2 px-1.5">
                {weeklyBuckets.map(({ day, dateKey, count }) => {
                  const heightPercent = Math.max(0, Math.min((count / yAxisMax) * 100, 100));
                  return (
                    <div key={dateKey} className="flex h-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-10 rounded-t-md bg-linear-to-t from-blue-600 to-blue-500 shadow-sm transition-[height] duration-700 ease-out"
                        style={{ height: `${heightPercent}%` }}
                        title={`${day}: ${count} activities`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spacer aligns with Y-axis width */}
            <div />

            {/* X-axis labels with day score */}
            <div className="mt-2 grid" style={{ gridTemplateColumns: `repeat(${weeklyBuckets.length}, minmax(0, 1fr))` }}>
              {weeklyBuckets.map(({ day, dateKey, count }) => (
                <div key={dateKey} className="text-center">
                  <div className="text-xs font-medium text-slate-700">{day}</div>
                  <div className="mt-1 text-[11px] font-semibold text-blue-600">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Study Sets Section - Virtualized with max 5 visible */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4">
            <Brain className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Study Sets</h2>
          </div>
          {/* Virtualized scrollable container - max 5 items visible */}
          <div className="mt-2 max-h-70 space-y-2 overflow-y-auto">
            {recentSets.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                No sets yet. Generate flashcards or quizzes to start tracking progress.
              </p>
            ) : (
              <>
                {visibleRecentSets.map((set) => (
                  <Link
                    key={`${set.type}-${set.id}`}
                    to={set.documentId ? `/documents/${set.documentId}` : "/documents"}
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{set.title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">
                        {set.type === "flashcards" ? "Flashcards" : "Quiz"} • {set.count} • {set.documentTitle}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{formatTime(set.createdAt)}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </Link>
                ))}
                {/* Show indicator if more sets available - user can scroll */}
                {hasMoreRecent && (
                  <p className="px-3 py-2 text-center text-[10px] text-slate-400">
                    +{recentSets.length - visibleRecentCount} more • Scroll to see
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline Section - Virtualized with max 10 visible */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
          <Activity className="h-5 w-5 text-violet-500" />
          <h2 className="text-lg font-semibold text-slate-900">Activity Timeline</h2>
        </div>
        {/* Virtualized scrollable container - max 10 items visible */}
        <div className="mt-4 max-h-100 space-y-3 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-slate-500 py-8 text-center">Loading progress...</p>
          ) : activity.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 text-center">
              No tracked activity yet. Open flashcards and quizzes to build your timeline.
            </p>
          ) : (
            <>
              {visibleActivity.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all hover:bg-blue-50">
                  {/* Index Number */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                    {index + 1}
                  </div>

                  {/* Item Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {/* Correctness Status - Only for Answered */}
                      {typeof item.isCorrect === "boolean" && (
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          item.isCorrect
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : "bg-rose-100 text-rose-700 border-rose-300"
                        }`}>
                          {item.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Timestamp */}
                  <div className="ml-2 flex shrink-0 items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 whitespace-nowrap border border-slate-200">
                    <Clock3 className="h-4 w-4" />
                    <span>{formatTime(item.createdAt)}</span>
                  </div>
                </div>
              ))}
              {/* Show indicator if more activity available - user can scroll */}
              {hasMoreActivity && (
                <div className="flex items-center justify-center gap-2 py-4 text-slate-400 border-t border-slate-100">
                  <span className="text-xs font-semibold">+{activity.length - visibleActivityCount} more activities</span>
                  <span className="text-xs">↓ Scroll to view</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Learning Toolkit Section */}
      <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-6 shadow-sm">
        <div className="flex items-center gap-2 pb-6">
          <Wand2 className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Learning Toolkit</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
          <div className="lg:col-span-1">
            <PomodoroTimer collapsed={false} />
          </div>
          <div className="lg:col-span-1">
            <PersonaSwitcher collapsed={false} />
          </div>
          <div className="lg:col-span-1">
            <DailyConcept collapsed={false} />
          </div>
          <div className="lg:col-span-1">
            <TodoWidget collapsed={false} />
          </div>
        </div>
      </div>
    </div>
  );
}