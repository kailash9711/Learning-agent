import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2, ListTodo } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function TodoWidget({ collapsed, isDark = false }) {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("sidebar-todos");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("sidebar-todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ id: Date.now(), text: input, completed: false }, ...todos]);
    setInput("");
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <ListTodo className="h-5 w-5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={`mx-2 my-2 rounded-2xl border p-4 shadow-sm ${
      isDark 
        ? "border-white/10 bg-white/5 text-white" 
        : "border-slate-200 bg-white text-slate-700"
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListTodo className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-violet-500'}`} />
          <h3 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Study Goals</h3>
        </div>
        <span className={`text-[10px] font-bold ${isDark ? 'text-white/40' : 'text-slate-400'}`}>{todos.filter(t => !t.completed).length} left</span>
      </div>

      <form onSubmit={addTodo} className="relative mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New task..."
          className={`w-full rounded-xl border pl-3 pr-10 py-2 text-xs outline-none transition-all ${
            isDark
              ? "bg-white/5 border-white/10 text-white focus:border-blue-400"
              : "bg-slate-50 border-slate-100 text-slate-700 focus:border-violet-400"
          }`}
        />
        <button type="submit" className={`absolute right-1 top-1 p-1.5 rounded-lg text-white transition-colors ${
          isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-violet-500 hover:bg-violet-600'
        }`}>
          <Plus className="h-3 w-3" />
        </button>
      </form>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className={`group flex items-center gap-2 rounded-xl p-2 transition-colors ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
              }`}
            >
              <button onClick={() => toggleTodo(todo.id)} className="shrink-0">
                {todo.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className={`h-4 w-4 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
                )}
              </button>
              <span className={`flex-1 text-[11px] font-medium leading-tight truncate ${
                todo.completed 
                  ? (isDark ? 'text-white/30 line-through' : 'text-slate-400 line-through') 
                  : (isDark ? 'text-white/80' : 'text-slate-700')
              }`}>
                {todo.text}
              </span>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {todos.length === 0 && (
          <p className="text-center py-4 text-[10px] font-medium text-slate-400 italic">No tasks today. Add one!</p>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
