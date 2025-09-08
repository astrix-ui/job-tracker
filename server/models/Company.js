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
    default: 'Applied',
    trim: true
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
    maxlength: 7000
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
  },
  location: {
    type: String,
    trim: true
  },
  bondYears: {
    type: Number,
    min: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  pastActionNotifications: [{
    actionDate: {
      type: Date,
      required: true
    },
    notificationCreated: {
      type: Date,
      default: Date.now
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completionResponse: {
      type: String,
      trim: true
    },
    respondedAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);