import express from 'express';
import {
  getAllQuizzes,
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz,
  logQuizActivity,
  getQuizHistory,
} from '../quiz/quiz.controller.js';
import { isAuth } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
// Iska matlab hai har request ke liye valid token zaroori hai
router.use(isAuth);

// Routes mapping
router.get('/', getAllQuizzes);                     // User ke saare quiz sets
router.get('/history', getQuizHistory);             // User quiz activity history (latest first)
router.post('/activity', logQuizActivity);          // Track quiz view/answer events
router.get('/quiz/:id', getQuizById);          // Ek specific quiz ka data (questions) lene ke liye
router.get('/:documentId', getQuizzes);        // Kisi specific document ke saare quizzes fetch karne ke liye
router.post('/:id/submit', submitQuiz);        // Quiz answers submit karne aur score calculate karne ke liye
router.get('/:id/results', getQuizResults);    // Quiz ke final results aur explanation dekhne ke liye
router.delete('/:id', deleteQuiz);             // Kisi purane quiz record ko delete karne ke liye

export default router;