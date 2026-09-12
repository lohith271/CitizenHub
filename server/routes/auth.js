const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const ACCESS_SECRET = process.env.JWT_SECRET || 'citizenhub_super_secret_jwt_key_2026_hackathon';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'citizenhub_refresh_secret_token_key_2026';

// Generate 15-minute Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, status: user.status },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate 7-day Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a citizen or apply as campaigner
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      city,
      state,
      skills,
      causes,
      phone,
      organization,
      organizationBio,
    } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    let userRole = role || 'citizen';
    // Citizens are active immediately; ALL campaigners require Admin approval
    let userStatus = userRole === 'campaigner' ? 'pending_approval' : 'active';

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      status: userStatus,
      organization: userRole === 'campaigner' ? organization || 'Independent Campaigner' : null,
      organizationBio: userRole === 'campaigner' ? organizationBio || '' : null,
      city: city || 'National',
      state: state || 'India',
      skills: Array.isArray(skills) ? skills : [],
      causes: Array.isArray(causes) ? causes : [],
      phone,
    });

    // 5. If pending approval, notify user without issuing active tokens
    if (userStatus === 'pending_approval') {
      return res.status(201).json({
        success: true,
        message: 'Campaigner application submitted! Your account is currently pending review by Jhatkaa administrators.',
        isPending: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          organization: user.organization,
        },
      });
    }

    // 6. Active user: Issue Access Token + Refresh Token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created and activated successfully',
      isPending: false,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        city: user.city,
        skills: user.skills,
        causes: user.causes,
        badges: user.badges,
        reliabilityScore: user.reliabilityScore,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user, check approval status & issue Access + Refresh tokens
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check approval status for campaigners
    if (user.status === 'pending_approval') {
      return res.status(403).json({
        success: false,
        message: 'Your campaigner application is currently under review by Jhatkaa administrators. You will be notified once approved.',
        status: 'pending_approval',
      });
    }

    if (user.status === 'rejected' || user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated or rejected by administrators.',
        status: user.status,
      });
    }

    // Issue new dual tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        organization: user.organization,
        city: user.city,
        skills: user.skills,
        causes: user.causes,
        badges: user.badges,
        reliabilityScore: user.reliabilityScore,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Issue new Access Token using valid Refresh Token
// @access  Public (needs valid refresh token)
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token is required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Find user and verify stored refresh token matches
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token session' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'User account is not active' });
    }

    // Issue new access token (15 mins)
    const newAccessToken = generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh token' });
  }
});

// @route   POST /api/auth/logout
// @desc    Revoke refresh token
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update volunteer profile (skills, causes, city)
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { city, state, skills, causes, phone, name } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (city) user.city = city;
    if (state) user.state = state;
    if (phone) user.phone = phone;
    if (skills) user.skills = Array.isArray(skills) ? skills : user.skills;
    if (causes) user.causes = Array.isArray(causes) ? causes : user.causes;

    if (user.skills.length >= 3 && !user.badges.includes('Multi-Talented Activist')) {
      user.badges.push('Multi-Talented Activist');
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// ==========================================
// ADMIN APPROVAL WORKFLOW FOR CAMPAIGNERS
// ==========================================

// @route   GET /api/auth/pending-campaigners
// @desc    List all campaigners waiting for admin approval
// @access  Private (Admin only)
router.get('/pending-campaigners', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingList = await User.find({
      role: 'campaigner',
      status: 'pending_approval',
    }).select('name email city organization organizationBio createdAt');

    res.json({
      success: true,
      count: pendingList.length,
      campaigners: pendingList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending campaigners' });
  }
});

// @route   PUT /api/auth/review-campaigner/:id
// @desc    Admin approves or rejects a campaigner
// @access  Private (Admin only)
router.put('/review-campaigner/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { decision } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be 'approve' or 'reject'" });
    }

    const campaigner = await User.findById(req.params.id);
    if (!campaigner || campaigner.role !== 'campaigner') {
      return res.status(404).json({ success: false, message: 'Campaigner application not found' });
    }

    campaigner.status = decision === 'approve' ? 'active' : 'rejected';
    await campaigner.save();

    res.json({
      success: true,
      message: decision === 'approve'
        ? `Campaigner ${campaigner.name} (${campaigner.organization}) has been APPROVED!`
        : `Campaigner application for ${campaigner.name} has been REJECTED.`,
      campaigner: {
        id: campaigner._id,
        name: campaigner.name,
        email: campaigner.email,
        status: campaigner.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to review campaigner' });
  }
});

// @route   GET /api/auth/volunteers
// @desc    Volunteer search directory for Campaigners & Admins
// @access  Private (Campaigner / Admin)
router.get('/volunteers', protect, authorize('campaigner', 'admin'), async (req, res) => {
  try {
    const { skill, city, cause, search } = req.query;
    const query = { role: 'citizen', status: 'active' };

    if (skill) {
      query.skills = { $in: [new RegExp(skill, 'i')] };
    }
    if (city && city !== 'All') {
      query.city = new RegExp(city, 'i');
    }
    if (cause) {
      query.causes = { $in: [new RegExp(cause, 'i')] };
    }
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { skills: new RegExp(search, 'i') },
      ];
    }

    const volunteers = await User.find(query).select(
      'name email city state skills causes badges reliabilityScore createdAt'
    );

    res.json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch volunteer directory' });
  }
});

module.exports = router;
