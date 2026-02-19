import React from 'react'
import { Navigate, Route, Router, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const isAuthenticated = true; // Replace with actual authentication logic
  const loading = false; // Replace with actual loading state
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace /> } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path='*' element={<NotFoundPage />} />


        <Route element={<ProtectedRoute  />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here */}
          <Route path="/documents" element={<DocumentList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/flashcards" element={<FlashcardList />} />
          <Route path="/document/:id/flashcards" element={<FlashcardDetail />} />
          <Route path="/quizzes/:quizId" element={<QuizList />} />
          <Route path="/quizzes/:quizId/details" element={<QuizDetail />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
