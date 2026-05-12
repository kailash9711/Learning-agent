import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Brain,
  TrendingUp,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Mail,
  User,
  Lock,
  X,
  Clock3,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import brandMortarboard from "../assets/brand/mortarboard.svg";
import { motion } from "motion/react";
import { setRightTool } from "./slices/uiSlice";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Documents", url: "/documents", icon: Brain },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Focus Timer", url: "/focus", icon: Clock3 },
  { title: "AI Specialist", url: "/ai-specialist", icon: Sparkles },
  { title: "Daily Recall", icon: Brain, type: "tool", toolId: "concept", color: "text-violet-500" },
  { title: "Study Goals", url: "/goals", icon: X, rotate: 45 },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const activeTool = useSelector((state) => state.ui.activeRightTool);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const toggleTool = (tool) => {
    dispatch(setRightTool(activeTool === tool ? null : tool));
  };

  return (
    <aside
      className={[
        "sticky top-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        collapsed ? "w-[72px]" : "w-64",
      ].join(" ")}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:scale-110 transition-all duration-200"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-slate-500" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-slate-500" />
        )}
      </button>

      {/* Brand Section */}
      <div className="flex h-20 items-center px-4 mb-2">
        <div className="flex items-center gap-3 w-full">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-200 transition-transform hover:rotate-3">
            <img
              src={brandMortarboard}
              alt="Logo"
              className="h-6 w-6 invert"
            />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col leading-none"
            >
              <span className="text-lg font-black tracking-tight text-slate-900">iLearn</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mt-0.5">LMS AI</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-2">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400/80">
            Overview
          </p>
        )}
        {mainItems.map((item) => {
          const isTool = item.type === "tool";
          const isActive = isTool ? activeTool === item.toolId : false;

          if (isTool) {
            return (
              <button
                key={item.title}
                onClick={() => toggleTool(item.toolId)}
                className={[
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ")}
              >
                <item.icon 
                  className={["h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive ? item.color : "text-slate-400"].join(" ")} 
                  style={{ transform: item.rotate ? `rotate(${item.rotate}deg)` : "" }}
                />
                {!collapsed && <span>{item.title}</span>}
                {isActive && (
                  <motion.div
                    layoutId="active-tool-indicator"
                    className={`absolute ${collapsed ? "left-0 h-6 w-1 rounded-r-full" : "right-3 h-1.5 w-1.5 rounded-full"} ${item.color.replace("text", "bg")}`}
                  />
                )}
              </button>
            );
          }

          return (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                  {!collapsed && <span>{item.title}</span>}
                  {isActive && collapsed && (
                    <motion.div layoutId="active-nav" className="absolute left-0 h-6 w-1 rounded-r-full bg-slate-900" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto px-3 mt-6 space-y-1 custom-sidebar-scroll">
      </div>

      {/* User & Settings Section */}
      <div className="mt-auto border-t border-slate-100 p-3 space-y-1">
        <button
          onClick={() => setShowSettings(true)}
          className={[
            "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200",
            collapsed ? "justify-center px-0" : "",
          ].join(" ")}
        >
          <Settings className="h-5 w-5 shrink-0 transition-transform group-hover:rotate-45" />
          {!collapsed && <span>Settings</span>}
        </button>

        {!collapsed && (
          <div className="mt-2 flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900">{user?.username ?? "Learner"}</p>
              <p className="truncate text-[10px] font-medium text-slate-500">{user?.email ?? "No email"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal (Simplified) */}
      {showSettings && !collapsed && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Action</p>
                <button
                  onClick={() => { setShowSettings(false); dispatch(logout()); }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors border border-rose-100"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar { width: 0px; }
      `}</style>
    </aside>
  );
}
