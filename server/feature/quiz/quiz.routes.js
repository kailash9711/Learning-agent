import express from 'express';
import {
  getQuizzes,
  getQuizById,
  submitQuiz,
  getQuizResults,
  deleteQuiz
} from '../quiz/quiz.controller.js';
import  isAuth from '../../middleware/isAuth.js';

const router = express.Router();

// All routes are protected
// Iska matlab hai har request ke liye valid token zaroori hai
router.use(isAuth);

// Routes mapping
router.get('/:documentId', getQuizzes);        // Kisi specific document ke saare quizzes fetch karne ke liye
router.get('/quiz/:id', getQuizById);          // Ek specific quiz ka data (questions) lene ke liye
router.post('/:id/submit', submitQuiz);        // Quiz answers submit karne aur score calculate karne ke liye
router.get('/:id/results', getQuizResults);    // Quiz ke final results aur explanation dekhne ke liye
router.delete('/:id', deleteQuiz);             // Kisi purane quiz record ko delete karne ke liye

export default router;