const mongoose = require('mongoose');
const { calculatePriorityScore } = require('../utils/priorityScore');

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Submitted', 'Reviewed', 'Scheduled', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Reviewed', 'Scheduled', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
      default: 'Submitted',
    },
    severity: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    safetyRisk: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    affectedPeople: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    waitingLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    priorityScore: {
      type: Number,
      default: 1,
    },
    estimatedDuration: {
      type: Number,
      min: 0,
      default: null,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

complaintSchema.pre('validate', function (next) {
  const score = calculatePriorityScore({
    severity: this.severity,
    safetyRisk: this.safetyRisk,
    affectedPeople: this.affectedPeople,
    waitingLevel: this.waitingLevel,
  });

  this.priorityScore = score;
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);
