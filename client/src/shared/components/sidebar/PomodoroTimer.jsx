import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Timer, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PomodoroTimer({ collapsed }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("study"); // study or break

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a subtle sound or notify
      if (mode === "study") {
        setMode("break");
        setTimeLeft(5 * 60);
      } else {
        setMode("study");
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setMode("study");
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <Timer className={`h-5 w-5 ${isActive ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
      </div>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 p-4 text-white shadow-xl shadow-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {mode === "study" ? <Timer className="h-4 w-4 text-emerald-400" /> : <Coffee className="h-4 w-4 text-orange-400" />}
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
            {mode === "study" ? "Deep Focus" : "Short Break"}
          </span>
        </div>
        <div className="text-xl font-mono font-bold tabular-nums">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            isActive ? 'bg-white/10 hover:bg-white/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
          }`}
        >
          {isActive ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
          {isActive ? "Pause" : "Start"}
        </button>
        <button
          onClick={reset}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {isActive && (
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 - timeLeft / (mode === "study" ? 25 * 60 : 5 * 60) }}
          className="mt-3 h-1 w-full bg-emerald-500/30 rounded-full origin-left overflow-hidden"
        >
          <div className="h-full w-full bg-emerald-500" />
        </motion.div>
      )}
    </div>
  );
}
