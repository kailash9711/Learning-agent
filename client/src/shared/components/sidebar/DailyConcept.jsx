import { useState, useEffect } from "react";
import { Brain, RefreshCw, Lightbulb, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSelector } from "react-redux";

export default function DailyConcept({ collapsed }) {
  const flashcards = useSelector((state) => state.flashcards.allItems);
  const [concept, setConcept] = useState(null);

  useEffect(() => {
    if (flashcards.length > 0) {
      const allCards = flashcards.flatMap(set => set.cards || []);
      if (allCards.length > 0) {
        const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
        setConcept(randomCard);
      }
    }
  }, [flashcards]);

  const refresh = () => {
    const allCards = flashcards.flatMap(set => set.cards || []);
    if (allCards.length > 0) {
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)];
      setConcept(randomCard);
    }
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <Brain className="h-5 w-5 text-violet-500" />
      </div>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-[2rem] bg-linear-to-br from-violet-50 to-indigo-50 border border-violet-100 p-6 shadow-sm relative overflow-hidden group min-h-[160px] flex flex-col">
      <div className="absolute top-0 right-0 h-24 w-24 bg-violet-200/20 rounded-bl-full pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs font-black text-violet-900 uppercase tracking-widest">Daily Recall</h3>
            <span className="text-[8px] font-bold text-violet-400 uppercase tracking-tight">Memory Refresher</span>
          </div>
        </div>
        <button 
          onClick={refresh} 
          className="p-2 hover:bg-violet-100 rounded-xl transition-all group-hover:rotate-180 duration-700"
        >
          <RefreshCw className="h-3.5 w-3.5 text-violet-600" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {concept ? (
            <motion.div
              key={concept.question}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <p className="text-sm font-bold text-slate-800 leading-snug tracking-tight">
                {concept.question}
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1 w-8 bg-violet-200 rounded-full" />
                <span className="text-[9px] font-black text-violet-300 uppercase tracking-widest">Answer Preview</span>
              </div>
              <p className="text-xs font-medium text-slate-500 leading-relaxed italic line-clamp-3">
                {concept.answer}
              </p>
            </motion.div>
          ) : (
            <div className="text-center py-4">
               <Lightbulb className="h-8 w-8 text-violet-200 mx-auto mb-2 opacity-50" />
               <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-relaxed">
                 Generate flashcards to <br/> enable daily recall.
               </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 pt-4 border-t border-violet-100/50">
         <button className="w-full py-2 rounded-xl bg-white border border-violet-100 text-[9px] font-black text-violet-600 uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all shadow-sm">
            Review Full Set
         </button>
      </div>
    </div>
  );
}
