const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide task instructions'],
    },
    requiredSkills: {
      type: [String],
      required: true,
      default: ['General Support'],
    },
    city: {
      type: String,
      default: 'Remote',
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    estimatedHours: {
      type: Number,
      default: 2,
    },
    deadlineHours: {
      type: Number,
      default: 48, // 48-hour auto-release timer
    },
    status: {
      type: String,
      enum: ['available', 'in_progress', 'under_review', 'completed'],
      default: 'available',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    proofSubmission: {
      submissionUrl: { type: String },
      notes: { type: String },
      submittedAt: { type: Date },
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewFeedback: {
      type: String,
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
