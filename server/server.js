require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { execFile } = require('child_process');
const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const { authorize } = require('./middleware/roleMiddleware');

// Route files
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const taskRoutes = require('./routes/tasks');
const donationRoutes = require('./routes/donations');

// Models for analytics overview
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Task = require('./models/Task');
const Donation = require('./models/Donation');

// Initialize app
const app = express();

const retrainCampaignModel = () => {
  return new Promise((resolve, reject) => {
    const modelScriptPath = path.join(__dirname, '..', 'ml', 'campaign_success_model.py');
    const pythonExecutable = process.env.PYTHON_BIN || 'python';

    execFile(pythonExecutable, [modelScriptPath], { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error('[ML Retrain] Failed to train model:', error.message);
        if (stderr) console.error(stderr.trim());
        return reject(error);
      }

      if (stdout) console.log(stdout.trim());
      if (stderr) console.warn(stderr.trim());
      console.log('[ML Retrain] Model retrained successfully.');
      resolve({ success: true, output: stdout.trim() });
    });
  });
};

const predictCampaignSuccess = (campaign) => {
  return new Promise((resolve, reject) => {
    const modelScriptPath = path.join(__dirname, '..', 'ml', 'campaign_success_model.py');
    const pythonExecutable = process.env.PYTHON_BIN || 'python';
    const payload = JSON.stringify(campaign);

    execFile(pythonExecutable, [modelScriptPath, '--predict', payload], { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        console.error('[ML Predict] Prediction failed:', error.message);
        if (stderr) console.error(stderr.trim());
        return reject(error);
      }

      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (parseError) {
        console.error('[ML Predict] Invalid JSON response:', stdout.trim());
        reject(parseError);
      }
    });
  });
};

// Connect Database
connectDB();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/donations', donationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CitizenHub API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/ml/retrain', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await retrainCampaignModel();
    res.json({
      success: true,
      message: 'Campaign success model retrained successfully',
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrain campaign success model',
      error: error.message,
    });
  }
});

app.post('/api/ml/predict', protect, async (req, res) => {
  try {
    const payload = req.body || {};
    const prediction = await predictCampaignSuccess(payload);
    res.json({
      success: true,
      prediction,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to predict campaign success',
      error: error.message,
    });
  }
});

// Analytics Overview API (for visual dashboards)
app.get('/api/analytics/overview', async (req, res) => {
  try {
    const totalVolunteers = await User.countDocuments({ role: 'citizen' });
    const totalCampaigns = await Campaign.countDocuments({ status: 'active' });
    const totalTasksCompleted = await Task.countDocuments({ status: 'completed' });
    const totalTasksInProgress = await Task.countDocuments({ status: 'in_progress' });
    
    // Aggregates
    const petitionsAgg = await Campaign.aggregate([
      { $group: { _id: null, totalSignatures: { $sum: '$signaturesCount' } } },
    ]);
    const totalSignatures = petitionsAgg.length > 0 ? petitionsAgg[0].totalSignatures : 0;

    const donationsAgg = await Donation.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);
    const totalRaisedINR = donationsAgg.length > 0 ? donationsAgg[0].totalAmount : 0;

    // City distribution of volunteers
    const cityDistribution = await User.aggregate([
      { $match: { role: 'citizen', city: { $ne: null } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Skill breakdown
    const skillBreakdown = await User.aggregate([
      { $match: { role: 'citizen' } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      success: true,
      metrics: {
        totalVolunteers,
        totalCampaigns,
        totalTasksCompleted,
        totalTasksInProgress,
        totalSignatures,
        totalRaisedINR,
      },
      charts: {
        cityDistribution: cityDistribution.map((item) => ({ city: item._id, volunteers: item.count })),
        skillBreakdown: skillBreakdown.map((item) => ({ skill: item._id, count: item.count })),
      },
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute analytics' });
  }
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;

retrainCampaignModel().catch((error) => {
  console.error('[ML Retrain] Initial retraining failed at startup:', error.message);
});

setInterval(() => {
  retrainCampaignModel().catch((error) => {
    console.error('[ML Retrain] Scheduled retraining failed:', error.message);
  });
}, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`[CitizenHub Server] Running on http://localhost:${PORT}`);
});
