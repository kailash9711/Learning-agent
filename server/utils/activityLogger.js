import Activity from '../feature/user/activity.model.js';

/**
 * Logs a user activity
 * @param {string} userId - ID of the user
 * @param {string} action - Action performed
 * @param {string} [documentId] - Optional document ID
 */
export const logActivity = async (userId, action, documentId = null) => {
  try {
    await Activity.create({
      userId,
      action,
      documentId
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We don't throw here to avoid failing the main request if logging fails
  }
};
