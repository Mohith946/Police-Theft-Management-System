const mongoose = require('mongoose');

const MatchResultSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  criminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Criminal',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchReason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'dismissed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate matches for same complaint-criminal pair
MatchResultSchema.index({ complaintId: 1, criminalId: 1 }, { unique: true });
MatchResultSchema.index({ matchScore: -1 });

module.exports = mongoose.model('MatchResult', MatchResultSchema);
