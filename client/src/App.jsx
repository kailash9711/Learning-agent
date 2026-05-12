import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./features/auth/Login";
import SignUp from "./features/auth/SignUp";
import { fetchUser } from "./features/auth/authSlice";
import DashboardLayout from "./features/dashboard/DashboardLayout";
import DashboardHome from "./features/dashboard/DashboardHome";
import DocumentsHome from "./features/documents/DocumentsHome";
import DocumentDetail from "./features/documents/DocumentDetail";
import ProgressPage from "./features/progress/ProgressPage";
import SettingsPage from "./features/settings/SettingsPage";
import FocusPage from "./features/focus/FocusPage";
import PersonaPage from "./features/persona/PersonaPage";
import GoalsPage from "./features/goals/GoalsPage";

const PrivateRoute = ({ children }) => {
  const { initialized, isAuthenticated } = useSelector((s) => s.auth);
  if (!initialized) return <p className="p-6 text-slate-500">Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected dashboard shell */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="documents" element={<DocumentsHome />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="ai-specialist" element={<PersonaPage />} />
        <Route path="goals" element={<GoalsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-3">
      <p className="text-2xl font-bold text-slate-700">{title}</p>
      <p className="text-slate-400 text-sm">Coming soon — stay tuned!</p>
    </div>
  );
}

export default App;

