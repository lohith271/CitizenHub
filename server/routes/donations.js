const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// Initialize Razorpay Instance
let razorpayInstance = null;
if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_YourRazorpayKeyId' &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_SECRET !== 'YourRazorpayKeySecret'
) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @route   POST /api/donations
// @desc    Direct INR donation entry (used by direct tests & non-gateway contributions)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { campaignId, amount, donorName, donorEmail, paymentId, userId } = req.body;

    if (!campaignId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid campaignId and amount' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const donation = await Donation.create({
      campaignId: campaign._id,
      donorUser: userId || null,
      donorName: donorName || 'Generous Citizen',
      donorEmail: donorEmail || 'supporter@citizenhub.org',
      amount: Number(amount),
      currency: 'INR',
      paymentId: paymentId || `pay_direct_${Date.now()}`,
      status: 'successful',
    });

    // Increment campaign funds in real-time
    campaign.raisedAmount = (campaign.raisedAmount || 0) + Number(amount);
    await campaign.save();

    res.status(201).json({
      success: true,
      message: `Thank you! Your contribution of ₹${amount} has been received in single currency (INR).`,
      donation,
      campaignRaised: campaign.raisedAmount,
      targetAmount: campaign.targetAmount,
    });
  } catch (error) {
    console.error('Direct donation error:', error);
    res.status(500).json({ success: false, message: 'Failed to record donation' });
  }
});

// @route   POST /api/donations/create-order
// @desc    Create Razorpay Order in single currency (INR)
// @access  Public
router.post('/create-order', async (req, res) => {
  try {
    const { campaignId, amount } = req.body;

    if (!campaignId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid campaignId and amount' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const amountInINR = Number(amount);
    const amountInPaise = Math.round(amountInINR * 100); // Razorpay expects amount in paise

    // If real Razorpay keys are provided, create live order via SDK
    if (razorpayInstance) {
      const options = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}_${campaignId.toString().slice(-4)}`,
        notes: {
          campaignId: campaign._id.toString(),
          campaignTitle: campaign.title,
        },
      };

      const order = await razorpayInstance.orders.create(options);

      return res.json({
        success: true,
        orderId: order.id,
        amount: amountInINR,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        campaign: {
          id: campaign._id,
          title: campaign.title,
        },
      });
    }

    // Seamless Hackathon / Test fallback if Razorpay test keys are pending
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    res.json({
      success: true,
      orderId: mockOrderId,
      amount: amountInINR,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourRazorpayKeyId',
      isTestMode: true,
      message: 'Test mode active. Use this orderId in /verify to complete contribution.',
      campaign: {
        id: campaign._id,
        title: campaign.title,
      },
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment order' });
  }
});

// @route   POST /api/donations/verify
// @desc    Verify Razorpay payment signature & update campaign funds
// @access  Public
router.post('/verify', async (req, res) => {
  try {
    const {
      campaignId,
      amount,
      donorName,
      donorEmail,
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!campaignId || !amount || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Incomplete payment verification payload' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Cryptographic signature verification
    if (razorpayInstance && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
      }
    }

    // Record verified donation in database
    const donation = await Donation.create({
      campaignId: campaign._id,
      donorUser: userId || null,
      donorName: donorName || 'Generous Citizen',
      donorEmail: donorEmail || 'supporter@citizenhub.org',
      amount: Number(amount),
      currency: 'INR',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: 'successful',
    });

    // Increment campaign funds in real-time
    campaign.raisedAmount = (campaign.raisedAmount || 0) + Number(amount);
    await campaign.save();

    res.status(201).json({
      success: true,
      message: `Payment Verified! Thank you for contributing ₹${amount} in single currency (INR).`,
      donationId: donation._id,
      paymentId: razorpay_payment_id,
      amount: Number(amount),
      currency: 'INR',
      campaignRaised: campaign.raisedAmount,
      targetAmount: campaign.targetAmount,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment and record donation' });
  }
});

// @route   GET /api/donations/stats
// @desc    Get aggregate donation statistics across all campaigns
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const totalDonations = await Donation.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      currency: 'INR',
      totalRaisedINR: totalDonations.length > 0 ? totalDonations[0].totalAmount : 0,
      donationCount: totalDonations.length > 0 ? totalDonations[0].count : 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch donation stats' });
  }
});

module.exports = router;
