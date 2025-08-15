const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: [
      'Applied',
      'Interview Scheduled',
      'Technical Round',
      'HR Round',
      'Final Round',
      'Offer Received',
      'Rejected',
      'Withdrawn'
    ],
    default: 'Applied'
  },
  nextActionDate: {
    type: Date
  },
  interviewRounds: {
    type: Number,
    default: 0,
    min: 0
  },
  positionType: {
    type: String,
    enum: ['Internship', 'Full-time', 'Contract', 'Leads to Full Time'],
    default: 'Full-time'
  },
  positionTitle: {
    type: String,
    trim: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  salaryExpectation: {
    type: Number,
    min: 0
  },
  applicationPlatform: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);