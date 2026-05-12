import { useDispatch, useSelector } from "react-redux";
import { LogOut, User, Shield, Palette, Bell } from "lucide-react";
import { logout } from "../auth/authSlice";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Settings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Account and session controls</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Your frontend now stays aligned with the backend cookie session, so these controls act on the real authenticated user.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <User className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.username ?? "Learner"}</p>
              <p className="text-xs text-slate-500">{user?.email ?? "Signed-in account"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              { icon: Shield, title: "Cookie-backed auth", description: "Session state comes from the backend JWT cookie." },
              { icon: Bell, title: "Notifications", description: "Browser reminders can be added later without changing auth." },
              { icon: Palette, title: "Theme", description: "The current UI uses a warm editorial palette across all sections." },
            ].map((item) => {
              const SettingIcon = item.icon;
              return (
                <div key={item.title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <SettingIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50/60 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Danger zone</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">End your current session</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Logout clears the authenticated cookie-backed session on the server and resets the Redux auth state on the client.</p>
          <button onClick={() => dispatch(logout())} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}