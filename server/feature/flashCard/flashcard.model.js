import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true
        },
        title: {
            type: String,
            default: null
        },
        cards: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
                difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
                lastReviewed: { type: Date  , default: null},
                reviewCount: { type: Number, default: 0 },
                isStarred: { type: Boolean, default: false },
                createdAt: { type: Date, default: Date.now }
            }
        ],
        activityHistory: [
            {
                cardId: {
                    type: mongoose.Schema.Types.ObjectId,
                    default: null,
                },
                action: {
                    type: String,
                    enum: ["viewed", "answered"],
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                    default: null,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        
    },
    { timestamps: true }
)

flashcardSchema.index({ userId: 1, documentId: 1, createdAt: -1 });

const Flashcard = mongoose.models.Flashcard || mongoose.model("Flashcard", flashcardSchema);
export default Flashcard;