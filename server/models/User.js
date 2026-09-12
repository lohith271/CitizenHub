const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['citizen', 'campaigner', 'admin'],
      default: 'citizen',
    },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'rejected', 'suspended'],
      default: 'active', // Citizens are active immediately; Campaigners without VIP code are pending_approval
    },
    organization: {
      type: String,
      trim: true,
      default: null, // Only for campaigners
    },
    organizationBio: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      default: 'National',
      trim: true,
    },
    state: {
      type: String,
      default: 'India',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    causes: {
      type: [String],
      default: [],
    },
    reliabilityScore: {
      type: Number,
      default: 100,
    },
    badges: {
      type: [String],
      default: ['Community Member'],
    },
    phone: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
      select: false, // Don't return in normal queries
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
