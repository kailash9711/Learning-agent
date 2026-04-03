import { validationResult } from "express-validator";
import mongoose from "mongoose";
import User from "../user/user.model.js";
const userSchema = new mongoose.Schema(
  {
    userId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true
    },
    documentId : {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
        required: true
    },
    title: {
      type: String,
      required: true,
        trim: true
    },
    questions: [
      {
        question: { type: String, required: true },
        options: {
          type: [String],
          required: true,
          validate: {
            validator: (arr) => Array.isArray(arr) && arr.length === 4,
            message: 'Options must be an array of 4 strings'
          }
        },
        correctAnswer: { type: String, required: true },
        explanation: { type: String },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
        }   
    ],

     userAnswer:[{
            questionIndex: { type: Number, required: true },
            selectedOption: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
            answeredAt: { type: Date, default: Date.now }
        }],

       score: { type: Number, default: 0 },
       totalQuestions: { type: Number, default: 0 },
       completedAt: { type: Date }
    },
    { timestamps: true }
);
// Index to ensure a user can only have one quiz per document
userSchema.index({ userId: 1, documentId: 1 }, { unique: true });
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", userSchema);
export default Quiz;

