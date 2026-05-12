import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: ['generate_flashcards', 'generate_quiz', 'generate_summary', 'chat', 'explain_concept', 'generate_mindmap', 'upload_document']
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient heatmap queries (activity per day for a user)
activitySchema.index({ userId: 1, timestamp: 1 });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
export default Activity;
