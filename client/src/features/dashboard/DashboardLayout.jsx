import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/shared/AppSidebar";
import { useSelector, useDispatch } from "react-redux";
import { closeRightTool } from "@/shared/slices/uiSlice";
import { X, ChevronRight, Sparkles, Brain, X as CloseIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import PomodoroTimer from "@/shared/components/sidebar/PomodoroTimer";
import TodoWidget from "@/shared/components/sidebar/TodoWidget";
import PersonaSwitcher from "@/shared/components/sidebar/PersonaSwitcher";
import DailyConcept from "@/shared/components/sidebar/DailyConcept";

export default function DashboardLayout() {
  const activeTool = useSelector((state) => state.ui.activeRightTool);
  const dispatch = useDispatch();

  const isModalTool = activeTool === 'concept';

  const getToolConfig = () => {
    switch (activeTool) {
      case 'pomodoro': return { title: 'Focus Timer', color: 'bg-emerald-500', component: <PomodoroTimer collapsed={false} /> };
      case 'todo': return { title: 'Quick Tasks', color: 'bg-blue-500', component: <TodoWidget collapsed={false} /> };
      case 'persona': return { title: 'AI Specialist', color: 'bg-amber-500', component: <PersonaSwitcher collapsed={false} /> };
      case 'concept': return { title: 'Daily Recall', color: 'bg-violet-600', component: <DailyConcept collapsed={false} /> };
      default: return null;
    }
  };

  const toolConfig = getToolConfig();

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <AppSidebar />
      
      <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
        <Outlet />
      </main>

      {/* Right Sidebar Tools (Pomodoro, Todo, Persona) */}
      <AnimatePresence>
        {toolConfig && !isModalTool && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-96 border-l border-slate-200 bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl ${toolConfig.color} flex items-center justify-center shadow-lg shadow-slate-200`}>
                   <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{toolConfig.title}</h2>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Active Module</span>
                </div>
              </div>
              <button 
                onClick={() => dispatch(closeRightTool())}
                className="p-2.5 hover:bg-slate-50 rounded-2xl transition-all group"
              >
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-sidebar-scroll bg-slate-50/30">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {toolConfig.component}
              </motion.div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
              <div className="flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                <span>Secure</span>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <span>Live Sync</span>
                <div className="h-1 w-1 rounded-full bg-slate-200" />
                <span>AI Powered</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modal Popup Tools (Daily Recall) */}
      <AnimatePresence>
        {toolConfig && isModalTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(closeRightTool())}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-6 right-6">
                 <button 
                  onClick={() => dispatch(closeRightTool())}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all"
                 >
                   <CloseIcon className="h-5 w-5" />
                 </button>
              </div>

              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-14 w-14 rounded-3xl bg-violet-600 flex items-center justify-center shadow-xl shadow-violet-200">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Daily Recall</h2>
                    <p className="text-xs font-bold text-violet-400 uppercase tracking-widest">Master your memory</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[32px] p-2">
                   {toolConfig.component}
                </div>
                
                <div className="mt-8 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] leading-relaxed">
                     Tip: Active recall is the most effective way <br/> to commit concepts to long-term memory.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .custom-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
