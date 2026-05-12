import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useDocuments } from "../../documents/hooks/useDocuments";

export function useDashboardStats() {
  const { documents, loading } = useDocuments();
  const user = useSelector((state) => state.auth.user);

  const { stats, activity, tabData } = useMemo(() => {
    const readyDocuments = documents.filter((document) => document.status === "ready").length;
    const processingDocuments = documents.filter((document) => document.status === "processing").length;
    const flashcardCount = documents.reduce((total, document) => total + (document.flashcardCount ?? 0), 0);
    const quizCount = documents.reduce((total, document) => total + (document.quizCount ?? 0), 0);

    return {
      stats: [
        { id: "documents", label: "Total Documents", value: documents.length, trend: "up", color: "blue" },
        { id: "flashcards", label: "Flashcards", value: flashcardCount, trend: "up", color: "green" },
        { id: "quizzes", label: "Quizzes", value: quizCount, trend: "up", color: "purple" },
        { id: "ready", label: "Ready Docs", value: readyDocuments + processingDocuments, trend: readyDocuments >= processingDocuments ? "up" : "down", color: "orange" },
      ],
      activity: documents.slice(0, 5).map((document, index) => ({
        id: document._id || index,
        type: document.status === "ready" ? "document" : "session",
        title: document.status === "ready" ? "Document ready" : "Processing document",
        subtitle: document.title,
        time: document.uploadedAt ? new Date(document.uploadedAt).toLocaleString() : "Recently",
      })),
      tabData: {
        overview: {
          weeklyGoal: Math.min(100, documents.length * 12),
          streak: Math.max(1, readyDocuments),
          topSubject: user?.username ? `${user.username}'s library` : "Your library",
          sessionsThisWeek: documents.length,
        },
        performance: {
          quizAvg: quizCount ? Math.min(100, 65 + quizCount * 3) : 0,
          improvement: quizCount ? `+${Math.min(20, quizCount * 2)}%` : "0%",
          bestSubject: readyDocuments ? "PDF study sets" : "Upload a document",
          weakSubject: processingDocuments ? "Processing queue" : "No weak subject yet",
        },
        schedule: [
          { day: "Mon", minutes: documents[0]?.flashcardCount ? 45 : 15 },
          { day: "Tue", minutes: documents[1]?.flashcardCount ? 90 : 25 },
          { day: "Wed", minutes: documents[2]?.flashcardCount ? 30 : 20 },
          { day: "Thu", minutes: documents[3]?.flashcardCount ? 60 : 10 },
          { day: "Fri", minutes: documents[4]?.flashcardCount ? 75 : 30 },
          { day: "Sat", minutes: 20 },
          { day: "Sun", minutes: 50 },
        ],
      },
    };
  }, [documents, user]);

  return { loading, stats, activity, tabData };
}
