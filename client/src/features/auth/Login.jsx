import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, login } from "./authSlice";
import { Sparkles, ShieldCheck, BookOpen, ArrowRight } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <section className="min-h-screen bg-[#f6f1e8] p-4 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#111827_0%,#1f2937_45%,#0f766e_100%)] px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-24 top-12 h-56 w-56 rounded-full bg-[#f59e0b] blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#22c55e] blur-3xl" />
          </div>
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">i Learn</p>
              <p className="text-sm text-white/70">PDFs into study tools</p>
            </div>
          </div>

          <div className="relative max-w-xl space-y-6 py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Welcome back</p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Study from your documents with one clean workspace.</h1>
            <p className="max-w-lg text-base leading-7 text-white/75">
              Sign in to access your uploads, generate flashcards and quizzes, and keep everything in sync through your cookie-backed session.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: BookOpen, label: "Upload PDFs" },
                { icon: ShieldCheck, label: "Cookie auth" },
                { icon: ArrowRight, label: "AI study flow" },
              ].map((item) => {
                const FeatureIcon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white/85 backdrop-blur">
                    <FeatureIcon className="h-4 w-4 text-[#fbbf24]" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="relative text-xs text-white/50">Organize, learn, and review without leaving the document view.</p>
        </div>

        <div className="flex items-center justify-center bg-[#fbfaf7] px-6 py-10 sm:px-10 lg:px-12">
          <form onSubmit={submit} className="w-full max-w-md rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Sign in</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Return to your workspace</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use the same account tied to your uploaded documents.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Password</label>
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100" type="password" placeholder="Your password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? "Please wait..." : "Login"}
            </button>

            <p className="mt-5 text-center text-sm text-slate-500">
              No account? <Link to="/signup" className="font-semibold text-emerald-700 hover:text-emerald-800">Create one</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;