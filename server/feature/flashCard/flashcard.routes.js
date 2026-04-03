import express from 'express';
import {
  getFlashcards,
  getAllFlashcardSets,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
} from '../flashCard/flashcard.controller.js';
import { isAuth } from "../../middleware/authMiddleware.js";


const flashcardRouter = express.Router();

// Sabhi routes ko protect karne ke liye middleware
flashcardRouter.use(isAuth);

// Routes definition
flashcardRouter.get('/', getAllFlashcardSets);
flashcardRouter.get('/:documentId', getFlashcards);
flashcardRouter.post('/:cardId/review', reviewFlashcard);
flashcardRouter.put('/:cardId/star', toggleStarFlashcard);
flashcardRouter.delete('/:id', deleteFlashcardSet);

export default flashcardRouter;