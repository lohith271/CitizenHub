const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    donorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    donorName: {
      type: String,
      required: true,
      default: 'Anonymous Supporter',
    },
    donorEmail: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'successful',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', DonationSchema);
