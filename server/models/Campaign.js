const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a campaign title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Please provide a short summary'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide the campaign story/details'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Air Pollution',
        'Forest & Wildlife',
        'Civic Rights & Justice',
        'Water & Sanitation',
        'Climate Action',
        'Women Safety & Equality',
        'Other',
      ],
      default: 'Air Pollution',
    },
    location: {
      type: String,
      default: 'National',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    },
    targetSignatures: {
      type: Number,
      default: 5000,
    },
    signaturesCount: {
      type: Number,
      default: 0,
    },
    targetAmount: {
      type: Number,
      default: 100000,
    },
    raisedAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modularBlocks: {
      hasPetition: { type: Boolean, default: true },
      hasTasks: { type: Boolean, default: true },
      hasDonation: { type: Boolean, default: true },
      hasEvent: { type: Boolean, default: false },
    },
    eventDetails: {
      eventDate: { type: Date },
      venue: { type: String },
      rsvpCount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed'],
      default: 'active',
    },
    signers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        city: String,
        signedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate slug before save
CampaignSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);
