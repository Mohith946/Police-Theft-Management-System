const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  matchResultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MatchResult',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationNotes: {
    type: String,
    required: [true, 'Please add verification details/notes']
  },
  verificationDate: {
    type: Date,
    default: Date.now
  }
});

VerificationSchema.index({ matchResultId: 1 });
VerificationSchema.index({ verifiedBy: 1 });

module.exports = mongoose.model('Verification', VerificationSchema);
