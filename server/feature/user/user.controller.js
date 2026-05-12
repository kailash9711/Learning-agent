import Activity from './activity.model.js';
import User from './user.model.js';

export const getActivityStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate activity by date for the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const stats = await Activity.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: oneYearAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
          },
          count: { $sum: 1 },
          actions: { $addToSet: "$action" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Format data for heatmap (array of { date: 'YYYY-MM-DD', count: X })
    const heatmapData = stats.map(item => ({
      date: item._id,
      count: item.count,
      actions: item.actions
    }));

    // Also get overall summary
    const summary = await Activity.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$action", total: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        heatmap: heatmapData,
        summary: summary.reduce((acc, curr) => {
          acc[curr._id] = curr.total;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    next(error);
  }
};
