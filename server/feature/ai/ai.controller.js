import ChatHistory from "../user/ChatHistory.js";
import Document from "../documents/document.model.js";
import Flashcard from "../flashCard/flashcard.model.js";
import Quiz from "../quiz/quiz.model.js";
import mongoose from "mongoose";
import * as aiService from "../../utils/aiService.js";
import { logActivity } from "../../utils/activityLogger.js";

const normalizeDocumentId = (value) => {
  const raw = typeof value === "object" && value !== null
    ? value._id ?? value.id ?? value.documentId
    : value;

  if (!raw) return null;
  const asString = String(raw);
  return mongoose.Types.ObjectId.isValid(asString) ? asString : null;
};
  

  export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId: rawDocumentId, count=10, title } = req.body;
        const documentId = normalizeDocumentId(rawDocumentId);
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
      const cards = await aiService.generateFlashcards(document.exactedText, parseInt(count, 10));

        // Save a new set every time so users can access previous generated sets.
      const flashcardSet = await Flashcard.create({
        userId: req.user._id,
        documentId: document._id,
        title: title || `${document.title} - Flashcards`,
        cards: cards.map(c => ({
          question: c.question,
          answer: c.answer,
          difficulty: c.difficulty,
          reviewCount: 0,
          isStarred: false
        }))
      });
        logActivity(req.user._id, 'generate_flashcards', document._id);
        res.status(200).json({success: true, data: flashcardSet, message: "Flashcards generated successfully"});
    } catch (error) {
        next(error);
    }
    };

export const generateQuiz = async (req, res, next) => {
    try {
    const { documentId: rawDocumentId, numQuestions = 5, title } = req.body;
    const documentId = normalizeDocumentId(rawDocumentId);

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
const questions = await aiService.generateQuiz(
  document.exactedText,
  parseInt(numQuestions, 10)
);

// Save a new quiz every generation so previous quiz sets remain accessible.
const quiz = await Quiz.create({
  userId: req.user._id,
  documentId: document._id,
  title: title || `${document.title} - Quiz`,
  questions,
  totalQuestions: questions.length,
  userAnswer: [],
  score: 0,
  completedAt: null,
});

logActivity(req.user._id, 'generate_quiz', document._id);

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
  const { documentId: rawDocumentId, focus = "", persona } = req.body;
  const documentId = normalizeDocumentId(rawDocumentId);

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

const summary = await aiService.generateSummary(document.exactedText, focus, persona);
logActivity(req.user._id, 'generate_summary', document._id);

res.status(200).json({
  success: true,
  data: { documentId: document._id,title: document.title, summary },
  message: 'Summary generated successfully'
});
    } catch (error) {
        next(error);
    }
};

export const generateMindMap = async (req, res, next) => {
  try {
    const { documentId: rawDocumentId } = req.body;
    const documentId = normalizeDocumentId(rawDocumentId);

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const mermaidCode = await aiService.generateMindMap(document.exactedText);

    logActivity(req.user._id, 'generate_mindmap', document._id);

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        mermaidCode,
      },
      message: "Mind map generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { documentId: rawDocumentId, question, persona } = req.body;
    const documentId = normalizeDocumentId(rawDocumentId);

    if (!documentId || !question?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId and question",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const chunks = Array.isArray(document.chunks) && document.chunks.length > 0
      ? document.chunks
      : [{ content: document.exactedText || "" }];

    const answer = await aiService.chatWithContext(question.trim(), chunks.slice(0, 12), persona);

    const userMessage = {
      role: "user",
      content: question.trim(),
      timestamp: new Date(),
    };

    const assistantMessage = {
      role: "assistant",
      content: answer,
      timestamp: new Date(),
    };

    await ChatHistory.findOneAndUpdate(
      { userId: req.user._id, documentId: document._id },
      {
        $setOnInsert: { userId: req.user._id, documentId: document._id },
        $push: { messages: { $each: [userMessage, assistantMessage] } },
      },
      { upsert: true, new: true }
    );

    logActivity(req.user._id, 'chat', document._id);

    res.status(200).json({
      success: true,
      data: {
        answer,
        userMessage,
        assistantMessage,
      },
      message: "Chat response generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const explainConcept = async (req, res, next) => {
    try {
    const { documentId: rawDocumentId, concept, audience = "beginner", detailLevel = "balanced", persona } = req.body;
    const documentId = normalizeDocumentId(rawDocumentId);

        if (!documentId || !concept?.trim()) {
          return res.status(400).json({
            success: false,
            error: 'Please provide documentId and concept',
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

        const explanation = await aiService.explainConcept(
          document.exactedText,
          concept.trim(),
          audience,
          detailLevel,
          persona
        );

        res.status(200).json({
          success: true,
          data: {
            documentId: document._id,
            title: document.title,
            concept: concept.trim(),
            audience,
            detailLevel,
            explanation,
          },
          message: 'Concept explanation generated successfully'
        });

        logActivity(req.user._id, 'explain_concept', document._id);
    } catch (error) {
    next(error);
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
    const documentId = normalizeDocumentId(req.params.documentId);

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