import { useDispatch, useSelector } from "react-redux";
import { setAiPersona } from "../../../features/documents/slices/aiSlice";
import { Sparkles, UserRound, GraduationCap, Users } from "lucide-react";
import { motion } from "motion/react";

const personas = [
  { id: "standard", name: "AI Assistant", icon: Sparkles, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "socratic", name: "Socratic Tutor", icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "specialist", name: "Specialist", icon: UserRound, color: "text-violet-500", bg: "bg-violet-50" },
  { id: "peer", name: "Study Peer", icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
];

export default function PersonaSwitcher({ collapsed }) {
  const dispatch = useDispatch();
  const currentPersona = useSelector((state) => state.ai.aiPersona);

  if (collapsed) {
    const active = personas.find(p => p.id === currentPersona) || personas[0];
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <active.icon className={`h-5 w-5 ${active.color}`} />
      </div>
    );
  }

  return (
    <div className="mx-2 my-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <h3 className="text-xs font-bold text-slate-800">AI Specialist</h3>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {personas.map((p) => (
          <button
            key={p.id}
            onClick={() => dispatch(setAiPersona(p.id))}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
              currentPersona === p.id 
                ? `${p.bg} ring-1 ring-inset ring-${p.color.split('-')[1]}-200` 
                : 'hover:bg-slate-50'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${currentPersona === p.id ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
              <p.icon className={`h-3.5 w-3.5 ${currentPersona === p.id ? p.color : 'text-slate-400'}`} />
            </div>
            <span className={`text-[11px] font-bold ${currentPersona === p.id ? 'text-slate-900' : 'text-slate-500'}`}>
              {p.name}
            </span>
            {currentPersona === p.id && (
              <motion.div layoutId="active-persona" className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
