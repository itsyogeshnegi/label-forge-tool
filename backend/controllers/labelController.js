import LabelHistory from '../models/LabelHistory.js';
import Statistics from '../models/Statistics.js';

// @desc    Generate label & record minimal history/increment stats
// @route   POST /api/labels/generate
// @access  Private
export const generateLabel = async (req, res) => {
  const { receiverName, phoneNumber } = req.body;

  if (!receiverName || !phoneNumber) {
    return res.status(400).json({ message: 'Receiver name and phone number are required' });
  }

  try {
    // 1. Create a minimal record in history
    const historyItem = await LabelHistory.create({
      receiverName,
      phoneNumber,
      generatedAt: new Date()
    });

    // 2. Increment Statistics totalLabelsGenerated count
    let stats = await Statistics.findOne();
    if (!stats) {
      stats = await Statistics.create({ totalLabelsGenerated: 1 });
    } else {
      stats.totalLabelsGenerated += 1;
      await stats.save();
    }

    res.status(201).json({
      success: true,
      message: 'Label recorded and stats updated successfully',
      data: {
        id: historyItem._id,
        receiverName: historyItem.receiverName,
        phoneNumber: historyItem.phoneNumber,
        generatedAt: historyItem.generatedAt,
        totalLabelsGenerated: stats.totalLabelsGenerated
      }
    });
  } catch (error) {
    console.error('Error generating label:', error);
    res.status(500).json({ message: 'Server error during label generation' });
  }
};

// @desc    Get label history (paginated, searchable)
// @route   GET /api/labels/history
// @access  Private
export const getLabelHistory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';

  try {
    // Create regex pattern for search
    const query = {};
    if (search) {
      query.$or = [
        { receiverName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skipIndex = (page - 1) * limit;

    const totalRecords = await LabelHistory.countDocuments(query);
    const records = await LabelHistory.find(query)
      .sort({ generatedAt: -1 })
      .skip(skipIndex)
      .limit(limit);

    res.json({
      records,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Server error during fetching history' });
  }
};

// @desc    Delete a label history record & decrement stats count
// @route   DELETE /api/labels/history/:id
// @access  Private
export const deleteLabelHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await LabelHistory.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Label history record not found' });
    }

    await LabelHistory.findByIdAndDelete(id);

    // Decrement Statistics totalLabelsGenerated count (cap at 0)
    let stats = await Statistics.findOne();
    if (stats && stats.totalLabelsGenerated > 0) {
      stats.totalLabelsGenerated -= 1;
      await stats.save();
    }

    res.json({ success: true, message: 'Record deleted and stats updated successfully' });
  } catch (error) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ message: 'Server error during deletion' });
  }
};
