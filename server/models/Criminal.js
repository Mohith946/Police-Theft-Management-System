const mongoose = require('mongoose');

const CriminalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a suspect name'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  aliases: {
    type: String,
    trim: true,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  physicalFeatures: {
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    hairColor: { type: String, trim: true },
    eyeColor: { type: String, trim: true },
    scars: { type: String, trim: true, default: 'none' },
    tattoos: { type: String, trim: true, default: 'none' }
  },
  lastKnownLocation: {
    type: String,
    required: [true, 'Please add last known address/area']
  },
  photoUrl: {
    type: String,
    default: null
  },
  qrCodeToken: {
    type: String,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    enum: ['active', 'incarcerated', 'deceased'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

CriminalSchema.pre('save', function(next) {
  if (!this.qrCodeToken) {
    const crypto = require('crypto');
    const randomBytes = crypto.randomBytes(8).toString('hex');
    this.qrCodeToken = `QR-CRIM-${Date.now()}-${randomBytes.toUpperCase()}`;
  }
  next();
});

CriminalSchema.index({ status: 1 });
CriminalSchema.index({ name: 1 });

module.exports = mongoose.model('Criminal', CriminalSchema);
