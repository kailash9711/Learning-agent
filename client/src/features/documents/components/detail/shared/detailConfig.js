import { FileText, MessageSquare, Wand2, BookOpen, HelpCircle, Share2 } from "lucide-react";

export const TABS = [
  { id: "content", label: "Content", Icon: FileText },
  { id: "chat", label: "Chat", Icon: MessageSquare },
  { id: "ai-actions", label: "AI Actions", Icon: Wand2 },
  { id: "mindmap", label: "Mind Map", Icon: Share2 },
  { id: "flashcards", label: "Flashcards", Icon: BookOpen },
  { id: "quizzes", label: "Quizzes", Icon: HelpCircle },
];

export const statusConfig = {
  ready: { color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400", label: "Ready" },
  processing: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400 animate-pulse", label: "Processing" },
  error: { color: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-400", label: "Error" },
};

export function formatBytes(bytes) {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
