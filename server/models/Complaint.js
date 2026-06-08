const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title for the complaint'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    required: [true, 'Please describe the theft details']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['vehicle', 'electronics', 'jewelry', 'cash', 'other']
  },
  theftDate: {
    type: Date,
    required: [true, 'Please provide the approximate date and time of theft']
  },
  theftLocation: {
    type: String,
    required: [true, 'Please provide the theft location address']
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'closed'],
    default: 'pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reporterName: {
    type: String,
    required: [true, 'Reporter name is required']
  },
  reporterContact: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ComplaintSchema.index({ complaintNumber: 1 }, { unique: true });
ComplaintSchema.index({ reportedBy: 1 });
ComplaintSchema.index({ status: 1 });

// Post-save trigger to automatically calculate match scores with criminals
ComplaintSchema.post('save', async function(doc, next) {
  try {
    // Dynamically require matchingService to avoid circular references
    const matchingService = require('../services/matchingService');
    console.log(`[Schema Hook] Complaint saved: ${doc.complaintNumber}. Running matcher...`);
    // Non-blocking background call
    matchingService.runMatchingForComplaint(doc).catch(err => {
      console.error('[Schema Hook Error] Background matching failed:', err);
    });
  } catch (err) {
    console.error('[Schema Hook Error] Trigger matching require failed:', err);
  }
  next();
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
