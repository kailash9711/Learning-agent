import express from 'express';
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  generateMindMap
} from '../ai/ai.controller.js';
import { isAuth } from "../../middleware/authMiddleware.js";

const aiRouter = express.Router();

// Sabhi AI routes ko protect karne ke liye middleware
aiRouter.use(isAuth);

// POST routes for AI generation actions
aiRouter.post('/generate-flashcards', generateFlashcards);
aiRouter.post('/generate-quiz', generateQuiz);
aiRouter.post('/generate-summary', generateSummary);
aiRouter.post('/chat', chat);
aiRouter.post('/explain-concept', explainConcept);
aiRouter.post('/generate-mindmap', generateMindMap);

// GET route for fetching chat history
aiRouter.get('/chat-history/:documentId', getChatHistory);

export default aiRouter;