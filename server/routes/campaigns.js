const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// @route   GET /api/campaigns
// @desc    Get all active campaigns
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, location, search } = req.query;
    const query = { status: 'active' };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (location && location !== 'All') {
      query.location = new RegExp(location, 'i');
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { summary: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('organizer', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: campaigns.length,
      campaigns,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ success: false, message: 'Server error fetching campaigns' });
  }
});

// @route   GET /api/campaigns/:id
// @desc    Get single campaign by ID or Slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    let campaign;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      campaign = await Campaign.findById(req.params.id).populate('organizer', 'name email');
    } else {
      campaign = await Campaign.findOne({ slug: req.params.id }).populate('organizer', 'name email');
    }

    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving campaign' });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign with modular blocks
// @access  Private (Campaigner / Admin)
router.post('/', protect, authorize('campaigner', 'admin'), async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      category,
      location,
      bannerImage,
      targetSignatures,
      targetAmount,
      modularBlocks,
      eventDetails,
    } = req.body;

    const campaign = await Campaign.create({
      title,
      summary,
      description,
      category: category || 'Air Pollution',
      location: location || 'National',
      bannerImage:
        bannerImage ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      targetSignatures: targetSignatures || 1000,
      targetAmount: targetAmount || 50000,
      modularBlocks: modularBlocks || {
        hasPetition: true,
        hasTasks: true,
        hasDonation: true,
        hasEvent: false,
      },
      eventDetails: eventDetails || {},
      organizer: req.user.id,
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ success: false, message: 'Failed to create campaign' });
  }
});

// @route   POST /api/campaigns/:id/sign
// @desc    Sign campaign petition (Citizen action)
// @access  Private (Registered Citizen)
router.post('/:id/sign', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    // Check if user already signed
    const alreadySigned = campaign.signers.some(
      (signer) => signer.user && signer.user.toString() === req.user.id.toString()
    );

    if (alreadySigned) {
      return res.status(400).json({
        success: false,
        message: 'You have already signed this petition! Thank you for taking action.',
      });
    }

    campaign.signers.push({
      user: req.user.id,
      name: req.user.name,
      city: req.user.city || 'India',
      signedAt: new Date(),
    });
    campaign.signaturesCount += 1;

    await campaign.save();

    res.json({
      success: true,
      message: 'Thank you! Your signature has been added.',
      signaturesCount: campaign.signaturesCount,
      targetSignatures: campaign.targetSignatures,
    });
  } catch (error) {
    console.error('Error signing petition:', error);
    res.status(500).json({ success: false, message: 'Failed to record signature' });
  }
});

module.exports = router;
