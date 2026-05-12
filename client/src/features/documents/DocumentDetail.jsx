import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, FileText, BookOpen, HelpCircle, Clock, AlertCircle } from "lucide-react";
import { useDocument } from "./hooks/useDocument";
import ContentTab from "./components/detail/content/ContentTab";
import ChatTab from "./components/detail/chat/ChatTab";
import AIActionsTab from "./components/detail/ai-actions/AIActionsTab";
import FlashcardsTab from "./components/detail/flashcards/FlashcardsTab";
import QuizzesTab from "./components/detail/quizzes/QuizzesTab";
import MindMapTab from "./components/detail/mindmap/MindMapTab";
import DetailSkeleton from "./components/detail/shared/DetailSkeleton";
import { TABS, statusConfig, formatBytes } from "./components/detail/shared/detailConfig";

export default function DocumentDetail() {
  const { id } = useParams();
  const {
    document: doc,
    flashcards,
    quizzes,
    activeQuiz,
    quizResult,
    quizHistory,
    chatMessages,
    summary,
    conceptExplanation,
    loading,
    error,
    sendChatMessage,
    generateSummary,
    explainConcept,
    generateFlashcards,
    trackFlashcardActivity,
    generateQuiz,
    trackQuizActivity,
    fetchQuizById,
    submitQuizAnswers,
    fetchQuizResults,
    generateMindMap,
    mindmap,
    actionLoading,
  } = useDocument(id);
  const [activeTab, setActiveTab] = useState("content");

  if (loading) return <DetailSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6 max-w-5xl mx-auto w-full">
        <Link
          to="/documents"
          className="flex items-center gap-1.5 w-fit text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm text-rose-600">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  const status = statusConfig[doc?.status] ?? statusConfig.ready;

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl mx-auto w-full">
      <Link
        to="/documents"
        className="flex items-center gap-1.5 w-fit text-sm text-slate-500 hover:text-slate-800 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Documents
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 ring-4 ring-emerald-100">
            <FileText className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">{doc?.title}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {formatBytes(doc?.fileSize)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <BookOpen className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-violet-600 font-medium">{doc?.flashcardCount ?? 0}</span> Flashcards
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-600 font-medium">{doc?.quizCount ?? 0}</span> Quizzes
              </span>
              <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-0 border-b border-slate-200">
        {TABS.map((tab) => {
          const TabIcon = tab.Icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px",
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
              ].join(" ")}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-120">
        {activeTab === "content" && <ContentTab doc={doc} />}
        {activeTab === "chat" && (
          <ChatTab
            doc={doc}
            messages={chatMessages}
            onSend={sendChatMessage}
            loading={actionLoading === "chat"}
          />
        )}
        {activeTab === "ai-actions" && (
          <AIActionsTab
            summary={summary}
            conceptExplanation={conceptExplanation}
            actionLoading={actionLoading}
            onGenerateSummary={generateSummary}
            onExplainConcept={explainConcept}
          />
        )}
        {activeTab === "flashcards" && (
          <FlashcardsTab
            doc={doc}
            flashcards={flashcards}
            onGenerate={generateFlashcards}
            onTrackActivity={trackFlashcardActivity}
            loading={actionLoading === "flashcards"}
          />
        )}
        {activeTab === "mindmap" && (
          <MindMapTab
            doc={doc}
            mermaidCode={mindmap?.mermaidCode}
            onGenerate={generateMindMap}
            loading={actionLoading === "mindmap"}
          />
        )}
        {activeTab === "quizzes" && (
          <QuizzesTab
            doc={doc}
            quizzes={quizzes}
            activeQuiz={activeQuiz}
            quizResult={quizResult}
            history={quizHistory}
            actionLoading={actionLoading}
            onGenerate={generateQuiz}
            onTrackActivity={trackQuizActivity}
            onOpenQuiz={fetchQuizById}
            onSubmitQuiz={submitQuizAnswers}
            onLoadResults={fetchQuizResults}
          />
        )}
      </div>
    </div>
  );
}
