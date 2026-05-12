import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocuments } from "../../documents/slices/documentsSlice";
import { fetchAllFlashcardSets, fetchFlashcardHistory } from "../../documents/slices/flashcardsSlice";
import { fetchAllQuizSets, fetchQuizHistory } from "../../documents/slices/quizzesSlice";
import apiClient from "../../../shared/apiClient";
import { API_PATHS } from "../../../shared/apiPath";
import { useState } from "react";

const asDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const dayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useProgressData() {
  const dispatch = useDispatch();
  const [userStats, setUserStats] = useState({ heatmap: [], summary: {} });
  const [statsLoading, setStatsLoading] = useState(false);

  const { items: documents, loading: documentsLoading } = useSelector((state) => state.documents);
  const { allItems: flashcardSets, activityHistory: flashcardHistory } = useSelector((state) => state.flashcards);
  const { allItems: quizSets, activityHistory: quizHistory } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchDocuments());
    dispatch(fetchAllFlashcardSets());
    dispatch(fetchAllQuizSets());
    dispatch(fetchFlashcardHistory());
    dispatch(fetchQuizHistory());

    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const { data } = await apiClient.get(API_PATHS.USER.STATS);
        setUserStats(data.data);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [dispatch]);

  const data = useMemo(() => {
    const readyDocuments = documents.filter((doc) => doc.status === "ready").length;
    const processingDocuments = documents.filter((doc) => doc.status === "processing").length;
    const allQuizAnswers = quizSets.flatMap((quiz) => quiz.userAnswer || []);
    const correctAnswers = allQuizAnswers.filter((answer) => answer.isCorrect).length;
    const accuracy = allQuizAnswers.length > 0 ? Math.round((correctAnswers / allQuizAnswers.length) * 100) : 0;

    const recentSets = [
      ...flashcardSets.map((set) => ({
        id: set._id,
        type: "flashcards",
        title: set.title || "Flashcard Set",
        count: set.cards?.length || 0,
        documentId: set.documentId?._id || set.documentId || null,
        documentTitle: set.documentId?.title || "Document",
        createdAt: set.createdAt,
      })),
      ...quizSets.map((set) => ({
        id: set._id,
        type: "quiz",
        title: set.title || "Quiz Set",
        count: set.questions?.length || 0,
        documentId: set.documentId?._id || set.documentId || null,
        documentTitle: set.documentId?.title || "Document",
        createdAt: set.createdAt,
      })),
    ]
      .sort((a, b) => (asDate(b.createdAt)?.getTime() || 0) - (asDate(a.createdAt)?.getTime() || 0))
      .slice(0, 10);

    const activity = [
      ...flashcardHistory.map((entry, index) => ({
        id: `flash-${entry._id || `${entry.createdAt || "na"}-${index}`}`,
        type: "flashcards",
        action: entry.action,
        isCorrect: entry.isCorrect,
        title: entry.cardQuestion || entry.title || "Flashcard activity",
        createdAt: entry.createdAt,
      })),
      ...quizHistory.map((entry, index) => ({
        id: `quiz-${entry._id || `${entry.createdAt || "na"}-${index}`}`,
        type: "quiz",
        action: entry.action,
        isCorrect: entry.isCorrect,
        title: entry.question || entry.title || "Quiz activity",
        createdAt: entry.createdAt,
      })),
    ]
      .sort((a, b) => (asDate(b.createdAt)?.getTime() || 0) - (asDate(a.createdAt)?.getTime() || 0))
      .slice(0, 20);

    const today = startOfDay(new Date());
    const weeklyBuckets = [];
    const bucketIndexByKey = new Map();

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      const key = dayKey(date);
      bucketIndexByKey.set(key, weeklyBuckets.length);
      weeklyBuckets.push({
        day: date.toLocaleDateString(undefined, { weekday: "short" }),
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        dateKey: key,
        count: 0,
      });
    }

    const weeklyEvents = [
      ...activity,
      ...recentSets.map((set) => ({ createdAt: set.createdAt })),
    ];

    for (const item of weeklyEvents) {
      const date = asDate(item.createdAt);
      if (!date) continue;

      const key = dayKey(startOfDay(date));
      const index = bucketIndexByKey.get(key);
      if (index === undefined) continue;
      weeklyBuckets[index].count += 1;
    }

    const stats = {
      documents: documents.length,
      readyDocuments,
      processingDocuments,
      flashcardSets: flashcardSets.length,
      quizSets: quizSets.length,
      answered: allQuizAnswers.length,
      accuracy,
      totalActivities: flashcardHistory.length + quizHistory.length,
    };

    return {
      stats,
      recentSets,
      activity,
      weeklyBuckets,
      heatmapData: userStats.heatmap,
      summaryStats: userStats.summary,
    };
  }, [documents, flashcardSets, flashcardHistory, quizSets, quizHistory, userStats]);

  return {
    loading: documentsLoading || statsLoading,
    ...data,
  };
}
