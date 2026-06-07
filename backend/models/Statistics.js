import mongoose from 'mongoose';

const statisticsSchema = new mongoose.Schema({
  totalLabelsGenerated: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Statistics = mongoose.model('Statistics', statisticsSchema);
export default Statistics;
