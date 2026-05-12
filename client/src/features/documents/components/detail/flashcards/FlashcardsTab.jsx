import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Plus, XCircle } from "lucide-react";

const getFlashcardNavKey = (setId) => `flashcard-nav-${setId}`;

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

export default function FlashcardsTab({ doc, flashcards, onGenerate, onTrackActivity, loading }) {
  const [customCount, setCustomCount] = useState(10);
  const [flashcardTitle, setFlashcardTitle] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [activeSetId, setActiveSetId] = useState(() => flashcards[0]?._id || null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState([]);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const viewedKeyRef = useRef("");

  // Sync selected set with server-provided sets.
  useEffect(() => {
    if (flashcards.length > 0) {
      const isValidSet = flashcards.some((set) => set._id === activeSetId);
      if (!isValidSet) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveSetId(flashcards[0]._id);
      }
    }
  }, [activeSetId, flashcards]);

  const activeSet = flashcards.find((set) => set._id === activeSetId) || flashcards[0];
  const activeCards = activeSet?.cards || [];
  const maxCardIndex = Math.max(0, activeCards.length - 1);

  // Sync local navigation state when active set changes.
  useEffect(() => {
    if (!activeSet?._id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentCardIndex(0);
      setHistoryStack([]);
      setIsAnswerVisible(false);
      return;
    }

    try {
      const raw = localStorage.getItem(getFlashcardNavKey(activeSet._id));
      if (!raw) {
        setCurrentCardIndex(0);
        setHistoryStack([]);
        setIsAnswerVisible(false);
        return;
      }

      const parsed = JSON.parse(raw);
      const persistedIndex = Number.isInteger(parsed?.currentCardIndex) ? parsed.currentCardIndex : 0;
      const persistedStack = Array.isArray(parsed?.historyStack)
        ? parsed.historyStack.filter((value) => Number.isInteger(value) && value >= 0)
        : [];

      setCurrentCardIndex(Math.min(persistedIndex, Math.max((activeSet.cards?.length || 1) - 1, 0)));
      setHistoryStack(persistedStack);
      setIsAnswerVisible(false);
    } catch {
      setCurrentCardIndex(0);
      setHistoryStack([]);
      setIsAnswerVisible(false);
    }
  }, [activeSet?._id, activeSet?.cards?.length]);

  // Keep index in bounds when cards list changes.
  useEffect(() => {
    if (!activeSet?._id) return;

    const safeIndex = Math.min(currentCardIndex, maxCardIndex);
    const payload = {
      currentCardIndex: safeIndex,
      historyStack,
    };

    localStorage.setItem(getFlashcardNavKey(activeSet._id), JSON.stringify(payload));
  }, [activeSet?._id, currentCardIndex, historyStack, maxCardIndex]);

  useEffect(() => {
    if (currentCardIndex > maxCardIndex) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentCardIndex(maxCardIndex);
    }
  }, [currentCardIndex, maxCardIndex]);

  const currentCard = activeCards[currentCardIndex] || null;

  useEffect(() => {
    if (!activeSet?._id || !currentCard?._id) return;

    const viewKey = `${activeSet._id}:${currentCard._id}:${currentCardIndex}`;
    if (viewedKeyRef.current === viewKey) return;
    viewedKeyRef.current = viewKey;

    onTrackActivity?.({
      setId: activeSet._id,
      cardId: currentCard._id,
      action: "viewed",
    });
  }, [activeSet?._id, currentCard?._id, currentCardIndex, onTrackActivity]);

  const handleCustomGenerate = async () => {
    await onGenerate(customCount, flashcardTitle || undefined);
    setShowCustomForm(false);
    setCustomCount(10);
    setFlashcardTitle("");
  };

  const handleQuickGenerate = async () => {
    await onGenerate(10);
  };

  const handleNext = () => {
    if (currentCardIndex >= maxCardIndex) return;

    setHistoryStack((prev) => [...prev, currentCardIndex]);
    setCurrentCardIndex((prev) => Math.min(prev + 1, maxCardIndex));
    setIsAnswerVisible(false);
  };

  const handlePrevious = () => {
    if (historyStack.length === 0) return;

    const previousIndex = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setCurrentCardIndex(Math.max(0, previousIndex));
    setIsAnswerVisible(false);
  };

  const handleAnswer = (isCorrect) => {
    if (!activeSet?._id || !currentCard?._id) return;

    onTrackActivity?.({
      setId: activeSet._id,
      cardId: currentCard._id,
      action: "answered",
      isCorrect,
    });
  };

  if (flashcards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-6 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-violet-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">No flashcards yet</p>
        <p className="mt-1 text-xs text-slate-500">Generate flashcards from {doc?.title ?? "this document"}.</p>
        <button
          onClick={handleQuickGenerate}
          disabled={loading}
          className="mt-5 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">Card Sets</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                disabled={loading}
                className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50 inline-flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
              <button
                onClick={handleQuickGenerate}
                disabled={loading}
                className="rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
              >
                {loading ? "..." : "Quick"}
              </button>
            </div>
          </div>
          
          {showCustomForm && (
            <div className="mt-3 space-y-2 rounded-lg border border-violet-200 bg-violet-50/50 p-3">
              <div>
                <label className="block text-xs font-semibold text-violet-900 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={flashcardTitle}
                  onChange={(e) => setFlashcardTitle(e.target.value)}
                  placeholder="Set name"
                  className="w-full rounded border border-violet-300 bg-white px-2 py-1 text-xs text-violet-900 outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-violet-900 mb-1">Number of cards</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customCount}
                  onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 10))}
                  className="w-full rounded border border-violet-300 bg-white px-2 py-1 text-xs text-violet-900 outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCustomGenerate}
                  disabled={loading}
                  className="flex-1 rounded bg-violet-600 px-2 py-1 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {loading ? "..." : "Create"}
                </button>
                <button
                  onClick={() => setShowCustomForm(false)}
                  className="flex-1 rounded border border-violet-300 px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {flashcards.map((set) => (
            <button
              key={set._id}
              onClick={() => setActiveSetId(set._id)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                activeSet?._id === set._id
                  ? "border-violet-300 bg-violet-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-semibold text-slate-800 truncate">
                {set.title || `Set ${flashcards.indexOf(set) + 1}`}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">{set.cards?.length ?? 0} cards</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{formatSetCreatedAt(set.createdAt)}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {!activeSet ? (
          <p className="text-sm text-slate-500">Select a card set from the left panel.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  {activeSet.title || "Flashcard Set"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeCards.length} {activeCards.length === 1 ? "card" : "cards"}
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                {activeCards.length} Cards
              </span>
            </div>

            {!currentCard ? (
              <p className="text-sm text-slate-500">No cards available in this set.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-500">
                      Card {currentCardIndex + 1} of {activeCards.length}
                    </p>
                    <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold capitalize text-violet-700">
                      {currentCard.difficulty || "medium"}
                    </span>
                  </div>

                  <p className="mt-3 text-base font-semibold text-slate-800">{currentCard.question}</p>
                  <button
                    type="button"
                    onClick={() => setIsAnswerVisible((prev) => !prev)}
                    className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 text-left text-sm leading-6 text-slate-700 hover:bg-slate-50"
                  >
                    {!isAnswerVisible ? (
                      <span className="font-medium text-violet-700">Click to reveal answer</span>
                    ) : (
                      <span>{currentCard.answer}</span>
                    )}
                  </button>
                  <div className="mt-2 text-[11px] text-slate-400">
                    Tap again to {isAnswerVisible ? "hide" : "show"} the answer.
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleAnswer(true)}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      I was correct
                    </button>
                    <button
                      onClick={() => handleAnswer(false)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      I was wrong
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={historyStack.length === 0}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentCardIndex >= maxCardIndex}
                    className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
