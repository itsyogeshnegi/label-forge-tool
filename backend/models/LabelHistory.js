import mongoose from 'mongoose';

const labelHistorySchema = new mongoose.Schema({
  receiverName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

const LabelHistory = mongoose.model('LabelHistory', labelHistorySchema);
export default LabelHistory;
