import { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FocusPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("study");
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const containerRef = useRef(null);

  // Timer Logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      const nextMode = mode === "study" ? "break" : "study";
      setMode(nextMode);
      setTimeLeft(nextMode === "study" ? 25 * 60 : 5 * 60);
      
      const chime = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      chime.volume = 0.5;
      chime.play().catch(() => {});
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "study" ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = 1 - timeLeft / (mode === "study" ? 25 * 60 : 5 * 60);

  return (
    <div 
      ref={containerRef}
      className="relative h-screen w-full bg-[#030303] text-white font-sans overflow-hidden flex flex-col items-center justify-center selection:bg-white/10"
    >
      {/* Immersive Background */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-10' : 'opacity-20'}`}>
        <div className={`absolute top-0 left-0 w-full h-full bg-linear-to-b ${mode === 'study' ? 'from-indigo-500/10' : 'from-emerald-500/10'} to-transparent`} />
      </div>

      {/* Header */}
      <div className="absolute top-10 flex items-center justify-between w-full px-12 z-20">
        <div className="flex items-center gap-3">
          <Zap className="h-4 w-4 text-white/20" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Focus Core</span>
        </div>
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-3 rounded-full text-white/20 hover:text-white transition-all"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Timer Core */}
      <main className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <svg className="w-[480px] h-[480px] -rotate-90 transform">
            <circle cx="240" cy="240" r="230" stroke="white" strokeWidth="0.5" fill="transparent" className="opacity-5" />
            <motion.circle
              cx="240"
              cy="240"
              r="230"
              stroke="white"
              strokeWidth="1.5"
              fill="transparent"
              strokeDasharray={230 * 2 * Math.PI}
              animate={{ strokeDashoffset: (230 * 2 * Math.PI) * (1 - progress) }}
              transition={{ duration: 1, ease: "linear" }}
              className="text-white/30"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[140px] font-black tracking-tighter tabular-nums leading-none">
              {formatTime(timeLeft)}
            </div>
            <div className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] opacity-10">
               {mode === 'study' ? 'Active' : 'Break'}
            </div>
          </div>
        </div>

        {/* Minimal Circle Buttons */}
        <div className="mt-16 flex items-center gap-10">
          <button
            onClick={toggleTimer}
            className={`h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              !isActive 
                ? "bg-white text-black" 
                : "border border-white/20 text-white hover:bg-white/5"
            }`}
          >
            {isActive ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current translate-x-0.5" />}
          </button>

          <button
            onClick={resetTimer}
            className="h-20 w-20 rounded-full border border-white/10 text-white/30 flex items-center justify-center hover:text-white hover:border-white/40 transition-all duration-300"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
      </main>

      {/* Mode Switcher */}
      <div className="absolute bottom-12 flex items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
         <button 
          onClick={() => { setMode('study'); setTimeLeft(25*60); setIsActive(false); }}
          className={`transition-all ${mode === 'study' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
         >
           Focus
         </button>
         <button 
          onClick={() => { setMode('break'); setTimeLeft(5*60); setIsActive(false); }}
          className={`transition-all ${mode === 'break' ? 'text-white' : 'text-white/20 hover:text-white/40'}`}
         >
           Break
         </button>
      </div>

      <style>{`
        body { background: #030303; }
      `}</style>
    </div>
  );
}
