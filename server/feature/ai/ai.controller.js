import ChatHistory from "../user/ChatHistory.js";
import Document from "../documents/document.model.js";
import Flashcard from "../flashcard/flashcard.model.js";
import Quiz from "../quiz/quiz.model.js";
import * as geminiService from "../../utils/geminiService.js";
  

  export const generateFlashcards = async (req, res, next) => {
    try {
        const {documentId, count=10} = req.body;
        if(!documentId) {
        return res.status(400).json({ success: false, error: "documentId is required", statusCode: 400 });
        }

      const document = await Document.findOne({
        _id: documentId,
        userId: req.user._id,
        status: "ready"
      });

        if(!document) {
        return res.status(404).json({ success: false, error: "Document not found or not ready", statusCode: 404 });
        }

        //generate flashcards using the utility function
      const cards = await geminiService.generateFlashcards(document.exactedText, parseInt(count, 10));

        //save flashcards to database
      const flashcardSet = await Flashcard.findOneAndUpdate({
        userId: req.user._id,
        documentId: document._id,
      }, {

            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(c => ({
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty,
                reviewCount: 0,
                isStarred: false
            }))

      }, { upsert: true, new: true, setDefaultsOnInsert: true });
        res.status(200).json({success: true, data: flashcardSet, message: "Flashcards generated successfully"});
    } catch (error) {
        next(error);
    }
    };

export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

if (!documentId) {
  return res.status(400).json({
    success: false,
    error: 'Please provide documentId',
    statusCode: 400
  });
}

const document = await Document.findOne({
  _id: documentId,
  userId: req.user._id,
  status: 'ready'
});

if (!document) {
  return res.status(404).json({
    success: false,
    error: 'Document not found or not ready',
    statusCode: 404
  });
}
const questions = await geminiService.generateQuiz(
  document.exactedText,
  parseInt(numQuestions, 10)
);

// Save to database
const quiz = await Quiz.create({
  userId: req.user._id,
  documentId: document._id,
  title: title || `${document.title} - Quiz`,
  questions: questions,
  totalQuestions: questions.length,
  userAnswer: [],
  score: 0
});

res.status(201).json({
  success: true,
  data: quiz,
  message: 'Quiz generated successfully'
});

    } catch (error) {
        next (error);
    }
};

export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

if (!documentId) {
  return res.status(400).json({
    success: false,
    error: 'Please provide documentId',
    statusCode: 400
  });
}

const document = await Document.findOne({
  _id: documentId,
  userId: req.user._id,
  status: 'ready'
});

if (!document) {
  return res.status(404).json({
    success: false,
    error: 'Document not found or not ready',
    statusCode: 404
  });
}

const summary = await geminiService.generateSummary(document.exactedText);
res.status(200).json({
  success: true,
  data: { documentId: document._id,title: document.title, summary },
  message: 'Summary generated successfully'
});
    } catch (error) {
        next(error);
    }
};

export const chat = async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
};

export const explainConcept = async (req, res, next) => {
    try {
        
    } catch (error) {
    next(error);
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

if (!documentId) {
  return res.status(400).json({
    success: false,
    error: 'Please provide documentId',
    statusCode: 400
  });
}

const chatHistory = await ChatHistory.findOne({
  userId: req.user._id,
  documentId: documentId
}).select('messages'); // Only retrieve the messages array

if (!chatHistory) {
  return res.status(200).json({
    success: true,
    data: [], // Return an empty array if no chat history found
    message: 'No chat history found for this document'
  });
}

res.status(200).json({
  success: true,
  data: chatHistory.messages,
  message: 'Chat history retrieved successfully'
});
    } catch (error) {
        next(error);
    }
};