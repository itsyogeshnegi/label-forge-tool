import Statistics from '../models/Statistics.js';

// @desc    Get label generation stats
// @route   GET /api/stats
// @access  Private
export const getStats = async (req, res) => {
  try {
    const stats = await Statistics.findOne();
    const count = stats ? stats.totalLabelsGenerated : 0;
    res.json({ totalLabelsGenerated: count });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error during stats retrieval' });
  }
};
