import { useEffect, useMemo, useRef, useState } from "react";
import { HelpCircle, CheckCircle2, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const getQuizNavKey = (quizId) => `quiz-nav-${quizId}`;

const formatActivityTime = (value) => {
  if (!value) return "just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  return date.toLocaleString();
};

const formatSetCreatedAt = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function QuizzesTab({
  doc,
  quizzes,
  activeQuiz,
  quizResult,
  history = [],
  actionLoading,
  onGenerate,
  onTrackActivity,
  onOpenQuiz,
  onSubmitQuiz,
  onLoadResults,
}) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [customCount, setCustomCount] = useState(5);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionHistoryStack, setQuestionHistoryStack] = useState([]);
  const viewedKeyRef = useRef("");

  const questions = activeQuiz?.questions ?? [];
  const maxQuestionIndex = Math.max(0, questions.length - 1);
  const activeQuestion = questions[currentQuestionIndex] || null;
  const canSubmit = questions.length > 0 && Object.keys(selectedAnswers).length === questions.length;

  // Sync local navigation state when active quiz changes.
  useEffect(() => {
    if (!activeQuiz?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentQuestionIndex(0);
      setQuestionHistoryStack([]);
      return;
    }

    try {
      const raw = localStorage.getItem(getQuizNavKey(activeQuiz._id));
      if (!raw) {
        setCurrentQuestionIndex(0);
        setQuestionHistoryStack([]);
        return;
      }

      const parsed = JSON.parse(raw);
      const persistedIndex = Number.isInteger(parsed?.currentQuestionIndex) ? parsed.currentQuestionIndex : 0;
      const persistedStack = Array.isArray(parsed?.questionHistoryStack)
        ? parsed.questionHistoryStack.filter((value) => Number.isInteger(value) && value >= 0)
        : [];

      setCurrentQuestionIndex(Math.min(persistedIndex, Math.max((activeQuiz.questions?.length || 1) - 1, 0)));
      setQuestionHistoryStack(persistedStack);
    } catch {
      setCurrentQuestionIndex(0);
      setQuestionHistoryStack([]);
    }
  }, [activeQuiz?._id, activeQuiz?.questions?.length]);

  // Persist current quiz navigation.
  useEffect(() => {
    if (!activeQuiz?._id) return;

    localStorage.setItem(
      getQuizNavKey(activeQuiz._id),
      JSON.stringify({ currentQuestionIndex, questionHistoryStack })
    );
  }, [activeQuiz?._id, currentQuestionIndex, questionHistoryStack]);

  useEffect(() => {
    if (currentQuestionIndex > maxQuestionIndex) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentQuestionIndex(maxQuestionIndex);
    }
  }, [currentQuestionIndex, maxQuestionIndex]);

  useEffect(() => {
    if (!activeQuiz?._id || !activeQuestion) return;

    const viewKey = `${activeQuiz._id}:${currentQuestionIndex}`;
    if (viewedKeyRef.current === viewKey) return;
    viewedKeyRef.current = viewKey;

    onTrackActivity?.({
      quizId: activeQuiz._id,
      questionIndex: currentQuestionIndex,
      action: "viewed",
    });
  }, [activeQuiz?._id, activeQuestion, currentQuestionIndex, onTrackActivity]);

  const visibleHistory = useMemo(() => (history || []).slice(0, 15), [history]);

  const handleSubmit = async () => {
    if (!activeQuiz?._id) return;

    const answers = questions.map((_, index) => ({
      questionIndex: index,
      selectedAnswer: selectedAnswers[index],
    }));

    await onSubmitQuiz(activeQuiz._id, answers);
    await onLoadResults(activeQuiz._id);
  };

  const handleNext = () => {
    if (currentQuestionIndex >= maxQuestionIndex) return;

    setQuestionHistoryStack((prev) => [...prev, currentQuestionIndex]);
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, maxQuestionIndex));
  };

  const handlePrevious = () => {
    if (questionHistoryStack.length === 0) return;

    const previousIndex = questionHistoryStack[questionHistoryStack.length - 1];
    setQuestionHistoryStack((prev) => prev.slice(0, -1));
    setCurrentQuestionIndex(Math.max(0, previousIndex));
  };

  const handleGenerate = async () => {
    const action = await onGenerate(5);
    const generatedId = action?.payload?.data?._id;

    if (generatedId) {
      setSelectedAnswers({});
      await onOpenQuiz(generatedId);
    }
  };
  
  const handleCustomGenerate = async () => {
    const generated = await onGenerate(customCount, quizTitle || undefined);
    const generatedId = generated?.payload?.data?._id;

    if (generatedId) {
      setSelectedAnswers({});
      setShowCustomForm(false);
      setCustomCount(5);
      setQuizTitle("");
      setTimeout(() => onOpenQuiz(generatedId), 100);
    }
  };

  if (quizzes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-6 text-center">
        <HelpCircle className="mx-auto h-8 w-8 text-emerald-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">No quiz generated yet</p>
        <p className="mt-1 text-xs text-slate-500">Create a quiz from {doc?.title ?? "this document"}.</p>
        <button
          onClick={handleGenerate}
          disabled={actionLoading === "quiz"}
          className="mt-5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {actionLoading === "quiz" ? "Generating..." : "Generate Quiz"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr_320px]">
      <aside className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Quiz Sets</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                disabled={actionLoading === "quiz"}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
              <button
                onClick={handleGenerate}
                disabled={actionLoading === "quiz"}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                {actionLoading === "quiz" ? "..." : "Quick"}
              </button>
            </div>
          </div>
          
          {showCustomForm && (
            <div className="mt-3 space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="Quiz name"
                  className="w-full rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-emerald-900 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-emerald-900 mb-1">Questions</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 5))}
                  className="w-full rounded border border-emerald-300 bg-white px-2 py-1 text-xs text-emerald-900 outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomGenerate}
                  disabled={actionLoading === "quiz"}
                  className="flex-1 rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading === "quiz" ? "..." : "Create"}
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 rounded border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {quizzes.map((quiz) => (
            <button
              key={quiz._id}
              onClick={() => {
                setSelectedAnswers({});
                onOpenQuiz(quiz._id);
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${activeQuiz?._id === quiz._id ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}
            >
              <p className="text-xs font-semibold text-slate-800 truncate">{quiz.title}</p>
              <p className="mt-1 text-[11px] text-slate-500">{quiz.questions?.length ?? 0} questions</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{formatSetCreatedAt(quiz.createdAt)}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {!activeQuiz ? (
          <p className="text-sm text-slate-500">Select a quiz set from the left panel.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{activeQuiz.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Answer all questions and submit.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                {questions.length} Questions
              </span>
            </div>

            {!activeQuestion ? (
              <p className="text-sm text-slate-500">No question found for this quiz.</p>
            ) : (
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  Q{currentQuestionIndex + 1}. {activeQuestion.question}
                </p>
                <div className="mt-3 space-y-2">
                  {(activeQuestion.options ?? []).map((option, oIndex) => {
                    const optionId = `${currentQuestionIndex}-${oIndex}`;
                    return (
                      <label key={optionId} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          checked={selectedAnswers[currentQuestionIndex] === option}
                          onChange={() => setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }))}
                          className="accent-emerald-500"
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={questionHistoryStack.length === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestionIndex >= maxQuestionIndex}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || actionLoading === "quiz-submit"}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {actionLoading === "quiz-submit" ? "Submitting..." : "Submit Quiz"}
              </button>
              {activeQuiz?._id ? (
                <button
                  onClick={() => onLoadResults(activeQuiz._id)}
                  disabled={actionLoading === "quiz-results"}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {actionLoading === "quiz-results" ? "Loading..." : "View Results"}
                </button>
              ) : null}
            </div>

            {quizResult?.quiz ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Result</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Score: <span className="font-semibold">{quizResult.score}</span> / {quizResult.totalQuestions}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <aside className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-800">Quiz Activity</p>
        <p className="mt-1 text-xs text-slate-500">Latest first</p>
        <div className="mt-3 space-y-2 max-h-136 overflow-y-auto pr-1">
          {visibleHistory.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
              No activity yet. Open a quiz question to start tracking.
            </p>
          ) : (
            visibleHistory.map((item) => (
              <div key={item._id || `${item.action}-${item.createdAt}`} className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-700 capitalize">{item.action}</p>
                {typeof item.isCorrect === "boolean" ? (
                  <p className={`mt-1 text-[11px] font-semibold ${item.isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                    {item.isCorrect ? "Correct" : "Incorrect"}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-slate-500">
                  {item.question || (Number.isInteger(item.questionIndex) ? `Question ${item.questionIndex + 1}` : "Quiz event")}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">{formatActivityTime(item.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
