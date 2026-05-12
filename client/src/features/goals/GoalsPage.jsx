import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar,
  Sparkles,
  Layout
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function GoalsPage() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("sidebar-todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    localStorage.setItem("sidebar-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ 
      id: Date.now(), 
      text: input, 
      completed: false, 
      priority,
      createdAt: new Date().toISOString() 
    }, ...todos]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  };

  const progressPercent = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100">
      {/* Soft Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50/50 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-rose-50/50 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 py-12">
        
        {/* Compact Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-100">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700">Daily Planner</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Focused Goals. <span className="text-slate-400">Better Results.</span>
          </h1>
        </header>

        {/* Compact Stats Row */}
        <section className="mb-8">
          <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-5 flex items-center justify-between gap-6 border border-slate-200">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Tasks</p>
                <p className="text-xl font-black text-slate-900">{stats.pending}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Done</p>
                <p className="text-xl font-black text-slate-900">{stats.completed}</p>
              </div>
            </div>
            <div className="flex-1 max-w-[140px]">
              <div className="flex justify-between mb-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Progress</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-700">{Math.round(progressPercent)}%</p>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-indigo-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Scaled-down Input Bar */}
        <section className="mb-8">
          <form onSubmit={addTodo} className="relative group">
            <div className="absolute -inset-2 bg-slate-100/50 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a study goal..."
              className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 transition-all"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
               <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-full shadow-sm scale-90">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      priority === p 
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button 
                type="submit"
                className="h-9 w-9 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:scale-110 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:bg-slate-200"
                disabled={!input.trim()}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </form>
        </section>

        {/* Condensed Goal Cards */}
        <section className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`group flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                  todo.completed 
                    ? 'border-slate-100 bg-slate-50/50' 
                    : 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5'
                }`}
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className="shrink-0 transition-all active:scale-90"
                >
                  {todo.completed ? (
                    <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-7 w-7 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-indigo-600 transition-colors">
                      <Circle className="h-4 w-4 text-transparent" />
                    </div>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-base font-bold tracking-tight transition-all duration-500 ${
                      todo.completed ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}>
                      {todo.text}
                    </p>
                    <span className={`h-2 w-2 rounded-full shadow-sm ${
                      todo.priority === 'high' ? 'bg-rose-500 ring-2 ring-rose-100' :
                      todo.priority === 'medium' ? 'bg-amber-500 ring-2 ring-amber-100' :
                      'bg-indigo-500 ring-2 ring-indigo-100'
                    }`} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Today
                  </span>
                </div>

                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="p-2.5 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {todos.length === 0 && (
            <div className="py-20 text-center">
               <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                 <Layout className="h-6 w-6 text-slate-400" />
               </div>
               <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Your day is clear.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
