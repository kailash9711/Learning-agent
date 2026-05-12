import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, signup } from "./authSlice";
import { Sparkles, ShieldCheck, ClipboardList, ArrowRight } from "lucide-react";

const SignUp = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(signup(form));
  };

  return (
    <section className="min-h-screen bg-[#f6f1e8] p-4 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-4xl border border-black/5 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1fr_1fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#1e3a8a_0%,#3b82f6_30%,#10b981_70%,#059669_100%)] px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-[10%] -top-[5%] h-80 w-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -left-[5%] -bottom-[10%] h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          </div>
          
          <div className="relative flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/10 ring-1 ring-white/30 backdrop-blur transition-transform group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">i Learn</p>
              <p className="text-sm text-white/80">Transform PDFs into study fuel</p>
            </div>
          </div>

          <div className="relative max-w-xl space-y-8 py-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-white/70">✨ Start Learning</p>
              <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl leading-tight">Study smarter, not harder.</h1>
            </div>
            
            <p className="max-w-lg text-base leading-8 text-white/90">
              Upload any PDF, generate AI-powered flashcards, quizzes, and summaries instantly. All in one workspace.
            </p>
            
            <div className="space-y-3">
              {[
                { icon: ClipboardList, label: "Smart uploads", desc: "PDF to study assets in seconds" },
                { icon: ShieldCheck, label: "Your privacy", desc: "Fully encrypted, never shared" },
                { icon: ArrowRight, label: "AI-powered", desc: "Gemini-generated content" },
              ].map((item) => {
                const FeatureIcon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur transition-all hover:bg-white/12 hover:border-white/20">
                    <FeatureIcon className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/70">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="relative text-xs text-white/60 font-medium">🔒 Zero tracking. Your data, your control.</p>
        </div>

        <div className="flex items-center justify-center bg-[#fbfaf7] px-6 py-10 sm:px-10 lg:px-12">
          <form onSubmit={submit} className="w-full max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Create account</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Get your study stack running</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Set up your profile and start generating learning assets right away.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Username</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" placeholder="Your display name" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" type="password" placeholder="Minimum 6 characters" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Please wait..." : "Create account"}
            </button>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already registered? <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUp;