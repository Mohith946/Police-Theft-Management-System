const mongoose = require('mongoose');

const StolenItemSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['vehicle', 'electronics', 'jewelry', 'cash', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  serialNumber: {
    type: String,
    default: ''
  },
  estimatedValue: {
    type: Number,
    default: 0
  },
  qrCodeToken: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['stolen', 'recovered'],
    default: 'stolen'
  },
  recoveredDate: {
    type: Date,
    default: null
  },
  recoveryLocation: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

StolenItemSchema.index({ complaintId: 1 });
StolenItemSchema.index({ status: 1 });

// Pre-save hook: set recoveredDate when status transitions to 'recovered'
StolenItemSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'recovered') {
    this.recoveredDate = new Date();
  }
  next();
});

// Post-save hook: Auto-resolve parent Complaint when all its items are recovered
StolenItemSchema.post('save', async function(doc, next) {
  if (doc.status === 'recovered') {
    try {
      const StolenItem = doc.constructor;
      const Complaint = mongoose.model('Complaint');

      // Count items belonging to this complaint that are still 'stolen'
      const activeStolenItems = await StolenItem.countDocuments({
        complaintId: doc.complaintId,
        status: 'stolen'
      });

      if (activeStolenItems === 0) {
        console.log(`[Schema Hook] All items for complaint ${doc.complaintId} recovered. Auto-resolving complaint.`);
        await Complaint.findByIdAndUpdate(doc.complaintId, { status: 'resolved' });
      }
    } catch (err) {
      console.error('[Schema Hook Error] Failed to resolve parent complaint:', err);
    }
  }
  next();
});

module.exports = mongoose.model('StolenItem', StolenItemSchema);
