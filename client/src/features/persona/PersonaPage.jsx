import { useSelector, useDispatch } from "react-redux";
import { setAiPersona } from "../documents/slices/aiSlice";
import { 
  Sparkles, 
  GraduationCap, 
  UserCircle, 
  Search, 
  MessageSquare, 
  Zap,
  Info
} from "lucide-react";
import { motion } from "motion/react";

const PERSONAS = [
  {
    id: "standard",
    name: "Professional Assistant",
    description: "Balanced, clear, and direct. Perfect for general summaries and quick questions.",
    icon: GraduationCap,
    color: "from-blue-500 to-indigo-600",
    features: ["Concise responses", "Fact-focused", "Standard formatting"]
  },
  {
    id: "socratic",
    name: "Socratic Tutor",
    description: "Guides you through questions rather than just giving answers. Best for deep learning.",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    features: ["Critical thinking", "Interactive guidance", "Step-by-step logic"]
  },
  {
    id: "specialist",
    name: "Expert Specialist",
    description: "Deep technical knowledge in your subject area. Uses advanced terminology.",
    icon: Zap,
    color: "from-amber-500 to-orange-600",
    features: ["Technical depth", "Domain expert", "Complex reasoning"]
  },
  {
    id: "peer",
    name: "Study Peer",
    description: "Explains concepts like a friend. Uses simple language and relatable analogies.",
    icon: UserCircle,
    color: "from-emerald-500 to-teal-600",
    features: ["Simple analogies", "Friendly tone", "Relatable examples"]
  }
];

export default function PersonaPage() {
  const activePersona = useSelector((state) => state.ai.aiPersona || 'standard');
  const dispatch = useDispatch();

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="flex flex-col gap-2 mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">AI Specialist Hub</h1>
        <p className="text-lg text-slate-500">Customize how your AI interacts with you across the platform.</p>
      </div>

      {/* Persona Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {PERSONAS.map((p) => {
          const isActive = activePersona === p.id;
          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -4 }}
              onClick={() => dispatch(setAiPersona(p.id))}
              className={`relative flex flex-col items-start text-left rounded-[32px] border-2 p-8 transition-all ${
                isActive 
                  ? "border-slate-900 bg-white shadow-2xl shadow-slate-200" 
                  : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
              }`}
            >
              {isActive && (
                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    Active
                  </div>
                </div>
              )}

              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${p.color} text-white shadow-lg mb-6`}>
                <p.icon className="h-7 w-7" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">{p.name}</h2>
              <p className="text-slate-500 leading-relaxed mb-6">{p.description}</p>

              <div className="mt-auto flex flex-wrap gap-2">
                {p.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                    <Info className="h-3 w-3 opacity-50" />
                    {f}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Specialist Chat Preview */}
      <div className="mt-12 rounded-[40px] bg-slate-900 p-10 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Ask a Specialist</h2>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
            Need help with something outside your documents? Start a global conversation with your active persona. 
            They can help with general learning, research, or study strategies.
          </p>
          <button className="group flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-slate-900 font-bold transition-all hover:bg-blue-50">
            Start Global Chat
            <Zap className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-125" />
          </button>
        </div>
      </div>
    </div>
  );
}
