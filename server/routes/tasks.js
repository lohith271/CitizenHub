const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload, processUploadedPhoto } = require('../middleware/uploadMiddleware');

// Helper to auto-release expired tasks
const releaseExpiredTasks = async () => {
  const now = new Date();
  await Task.updateMany(
    {
      status: 'in_progress',
      expiresAt: { $lt: now },
    },
    {
      $set: {
        status: 'available',
        assignedTo: null,
        assignedAt: null,
        expiresAt: null,
      },
    }
  );
};

// @route   GET /api/tasks
// @desc    Get all tasks with filters (skills, status, campaign, city)
// @access  Public
router.get('/', async (req, res) => {
  try {
    await releaseExpiredTasks();

    const { campaignId, skill, city, status, urgency } = req.query;
    const query = {};

    if (campaignId) query.campaignId = campaignId;
    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (city && city !== 'All') {
      query.$or = [{ city: new RegExp(city, 'i') }, { city: 'Remote' }];
    }
    if (skill && skill !== 'All') {
      query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    const tasks = await Task.find(query)
      .populate('campaignId', 'title category location')
      .populate('assignedTo', 'name email city skills')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tasks' });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get tasks assigned to logged-in citizen
// @access  Private (Citizen)
router.get('/my-tasks', protect, async (req, res) => {
  try {
    await releaseExpiredTasks();

    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('campaignId', 'title category location bannerImage')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching my tasks' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task under a campaign
// @access  Private (Campaigner / Admin)
router.post('/', protect, authorize('campaigner', 'admin'), async (req, res) => {
  try {
    const {
      campaignId,
      title,
      description,
      requiredSkills,
      city,
      urgency,
      estimatedHours,
      deadlineHours,
    } = req.body;

    const task = await Task.create({
      campaignId,
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills || 'General Support'],
      city: city || 'Remote',
      urgency: urgency || 'medium',
      estimatedHours: estimatedHours || 2,
      deadlineHours: deadlineHours || 48,
      status: 'available',
    });

    res.status(201).json({
      success: true,
      message: 'Task created and open for volunteer matching',
      task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// @route   POST /api/tasks/:id/claim
// @desc    Citizen accepts/claims a task (Timer starts)
// @access  Private (Citizen)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This task has already been claimed by another volunteer',
      });
    }

    // Check how many active in_progress tasks user has (limit to 3 to prevent hoarding)
    const activeTasks = await Task.countDocuments({
      assignedTo: req.user.id,
      status: 'in_progress',
    });
    if (activeTasks >= 3) {
      return res.status(400).json({
        success: false,
        message: 'You already have 3 active tasks in progress. Please submit one before claiming more!',
      });
    }

    // Set 48-hour (or custom deadlineHours) countdown
    const deadlineHours = task.deadlineHours || 48;
    const expiresAt = new Date(Date.now() + deadlineHours * 60 * 60 * 1000);

    task.assignedTo = req.user.id;
    task.assignedAt = new Date();
    task.expiresAt = expiresAt;
    task.status = 'in_progress';

    await task.save();

    res.json({
      success: true,
      message: `Task claimed successfully! You have ${deadlineHours} hours to submit your work.`,
      task,
    });
  } catch (error) {
    console.error('Error claiming task:', error);
    res.status(500).json({ success: false, message: 'Failed to claim task' });
  }
});

// @route   POST /api/tasks/:id/submit
// @desc    Citizen submits proof of work (Changes status to under_review)
// @access  Private (Citizen assignee)
router.post('/:id/submit', protect, upload.single('image'), async (req, res) => {
  try {
    let submissionUrl = (req.body && req.body.submissionUrl) || '';
    const notes = (req.body && req.body.notes) || '';

    // If an image file was uploaded, process it (Cloudinary or local fallback)
    if (req.file) {
      const uploadedUrl = await processUploadedPhoto(req.file, req);
      if (uploadedUrl) {
        submissionUrl = uploadedUrl;
      }
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.assignedTo || task.assignedTo.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not the assigned volunteer for this task',
      });
    }

    if (task.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `Task cannot be submitted in status: ${task.status}`,
      });
    }

    task.proofSubmission = {
      submissionUrl: submissionUrl || '',
      notes: notes || 'Work completed and submitted for campaigner review.',
      submittedAt: new Date(),
    };
    task.status = 'under_review';

    await task.save();

    res.json({
      success: true,
      message: 'Work submitted successfully! Sent to campaigner for review.',
      task,
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ success: false, message: 'Failed to submit task proof' });
  }
});

// @route   POST /api/tasks/:id/review
// @desc    Campaigner approves work (Completed) or requests changes
// @access  Private (Campaigner / Admin)
router.post('/:id/review', protect, authorize('campaigner', 'admin'), async (req, res) => {
  try {
    const { decision, feedback } = req.body; // decision: 'approve' | 'reject'
    const task = await Task.findById(req.params.id).populate('assignedTo');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'under_review') {
      return res.status(400).json({
        success: false,
        message: `Task is not currently under review (Status: ${task.status})`,
      });
    }

    task.reviewedBy = req.user.id;
    task.reviewedAt = new Date();
    task.reviewFeedback = feedback || '';

    if (decision === 'approve') {
      task.status = 'completed';

      // Reward volunteer with reliability score boost and badge
      if (task.assignedTo) {
        const volunteer = await User.findById(task.assignedTo._id);
        if (volunteer) {
          volunteer.reliabilityScore = Math.min(100, volunteer.reliabilityScore + 10);
          if (!volunteer.badges.includes('Action Champion')) {
            volunteer.badges.push('Action Champion');
          }
          await volunteer.save();
        }
      }
    } else {
      // Requested changes - goes back to in_progress with extra 24 hours
      task.status = 'in_progress';
      task.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }

    await task.save();

    res.json({
      success: true,
      message: decision === 'approve' ? 'Task verified & marked completed! Volunteer awarded points.' : 'Revision feedback sent to volunteer.',
      task,
    });
  } catch (error) {
    console.error('Error reviewing task:', error);
    res.status(500).json({ success: false, message: 'Failed to review task' });
  }
});

module.exports = router;
