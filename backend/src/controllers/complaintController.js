const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Location = require('../models/Location');
const User = require('../models/User');
const { calculatePriorityScore } = require('../utils/priorityScore');
const { generateRecommendations, comparePriorityAwareVsFCFS } = require('../utils/scheduler');

const normalizePriorityValue = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return 1;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1 || parsedValue > 5) {
    throw new Error(`${fieldName} must be a number between 1 and 5`);
  }

  return parsedValue;
};

const normalizeEstimatedDuration = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new Error('Estimated duration must be a non-negative number in minutes');
  }

  return parsedValue;
};

const populateComplaint = (query) => {
  return query
    .populate('category', 'name')
    .populate('location', 'name')
    .populate('reporter', 'name email role')
    .populate('assignedTo', 'name email role')
    .populate('statusHistory.changedBy', 'name email role');
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Reporter only)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority, image } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Title, description, category and location are required',
      });
    }

    // Force default priority values for reporters (they cannot set these)
    const severity = 1;
    const safetyRisk = 1;
    const affectedPeople = 1;
    const waitingLevel = 1;

    const priorityScore = calculatePriorityScore({
      severity,
      safetyRisk,
      affectedPeople,
      waitingLevel,
    });

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    let locationDoc = await Location.findOne({ name: location });
    if (!locationDoc) {
      locationDoc = await Location.create({ name: location });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: categoryDoc._id,
      location: locationDoc._id,
      priority: priority || 'Medium',
      severity,
      safetyRisk,
      affectedPeople,
      waitingLevel,
      priorityScore,
      image: image || '',
      reporter: req.user._id,
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: req.user._id,
          note: 'Complaint submitted',
        },
      ],
    });

    const populatedComplaint = await populateComplaint(Complaint.findById(complaint._id));

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: populatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my complaints (for reporter)
// @route   GET /api/complaints/my
// @access  Private
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await populateComplaint(
      Complaint.find({ reporter: req.user._id }).sort({ createdAt: -1 })
    );

    res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints based on role
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'reporter') {
      query.reporter = req.user._id;
    }

    if (req.user.role === 'technician') {
      query.assignedTo = req.user._id;
    }

    const complaints = await populateComplaint(
      Complaint.find(query).sort({ createdAt: -1 })
    );

    res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await populateComplaint(Complaint.findById(req.params.id));

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (
      req.user.role === 'reporter' &&
      complaint.reporter?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You are not authorized to view this complaint' });
    }

    if (
      req.user.role === 'technician' &&
      complaint.assignedTo?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You are not assigned to this complaint' });
    }

    res.status(200).json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (technician, supervisor, admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = [
      'Submitted',
      'Reviewed',
      'Scheduled',
      'Assigned',
      'In Progress',
      'Resolved',
      'Closed',
      'Rejected',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid complaint status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (
      req.user.role === 'technician' &&
      complaint.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'You can only update complaints assigned to you' });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status updated to ${status}`,
    });

    if (status === 'Resolved' && complaint.assignedTo) {
      const assignedTechnician = await User.findById(complaint.assignedTo);

      if (assignedTechnician) {
        assignedTechnician.currentWorkload = Math.max(
          0,
          Number(assignedTechnician.currentWorkload || 0) - 1
        );
        await assignedTechnician.save();
      }
    }

    await complaint.save();

    const updatedComplaint = await populateComplaint(Complaint.findById(complaint._id));

    res.status(200).json({
      message: 'Complaint status updated successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to technician
// @route   PATCH /api/complaints/:id/assign
// @access  Private (supervisor, admin)
const assignComplaintToTechnician = async (req, res, next) => {
  try {
    const { technicianId, note } = req.body;

    if (!technicianId) {
      return res.status(400).json({ message: 'Technician ID is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const technician = await User.findById(technicianId);
    if (!technician || technician.role !== 'technician') {
      return res.status(400).json({ message: 'A valid technician is required' });
    }

    complaint.assignedTo = technician._id;
    complaint.status = 'Assigned';
    complaint.statusHistory.push({
      status: 'Assigned',
      changedBy: req.user._id,
      note: note || `Assigned to ${technician.name}`,
    });

    await complaint.save();

    technician.currentWorkload = Number(technician.currentWorkload || 0) + 1;
    await technician.save();

    const updatedComplaint = await populateComplaint(Complaint.findById(complaint._id));

    res.status(200).json({
      message: 'Complaint assigned successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get technician recommendations for pending complaints
// @route   GET /api/complaints/recommendations
// @access  Private (supervisor, admin)
const getRecommendations = async (req, res, next) => {
  try {
    const pendingComplaints = await populateComplaint(
      Complaint.find({ status: { $in: ['Submitted', 'Reviewed'] } }).sort({
        priorityScore: -1,
        createdAt: -1,
      })
    );

    const technicians = await User.find({ role: 'technician', isActive: true }).select(
      'name role skills isAvailable currentWorkload'
    );

    const recommendations = generateRecommendations({
      complaints: pendingComplaints,
      technicians,
    });

    res.status(200).json({
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// Alias used by some routes
const getComplaintRecommendations = getRecommendations;

// @desc    Get evaluation summary (Priority-Aware vs FCFS)
// @route   GET /api/complaints/evaluation
// @access  Private (supervisor, admin)
const getEvaluationSummary = async (req, res, next) => {
  try {
    const pendingComplaints = await populateComplaint(
      Complaint.find({ status: { $in: ['Submitted', 'Reviewed'] } }).sort({
        priorityScore: -1,
        createdAt: -1,
      })
    );

    const technicians = await User.find({ role: 'technician', isActive: true }).select(
      'name role skills isAvailable currentWorkload'
    );

    const evaluation = comparePriorityAwareVsFCFS({
      complaints: pendingComplaints,
      technicians,
    });

    res.status(200).json(evaluation);
  } catch (error) {
    next(error);
  }
};

// Alias so routes that import `getEvaluation` still work
const getEvaluation = getEvaluationSummary;

// @desc    Update priority assessment (supervisor)
// @route   PATCH /api/complaints/:id/priority
// @access  Private (supervisor, admin)
const updateComplaintPriority = async (req, res, next) => {
  try {
    const { severity, safetyRisk, affectedPeople, waitingLevel, estimatedDuration } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const priorityFields = [
      { key: 'severity', value: severity, label: 'Severity' },
      { key: 'safetyRisk', value: safetyRisk, label: 'Safety risk' },
      { key: 'affectedPeople', value: affectedPeople, label: 'Affected people' },
      { key: 'waitingLevel', value: waitingLevel, label: 'Waiting level' },
    ];

    const hasPriorityUpdate = priorityFields.some((field) => field.value !== undefined);

    if (!hasPriorityUpdate) {
      return res.status(400).json({ message: 'Priority assessment values are required' });
    }

    priorityFields.forEach((field) => {
      if (field.value !== undefined) {
        complaint[field.key] = normalizePriorityValue(field.value, field.label);
      }
    });

    if (estimatedDuration !== undefined) {
      complaint.estimatedDuration = normalizeEstimatedDuration(estimatedDuration);
    }

    complaint.priorityScore = calculatePriorityScore({
      severity: complaint.severity,
      safetyRisk: complaint.safetyRisk,
      affectedPeople: complaint.affectedPeople,
      waitingLevel: complaint.waitingLevel,
    });

    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: req.user._id,
      note: 'Supervisor updated priority assessment',
    });

    await complaint.save();

    const updatedComplaint = await populateComplaint(Complaint.findById(complaint._id));

    res.status(200).json({
      message: 'Priority assessment updated successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    if (error.message && error.message.includes('must be a number between 1 and 5')) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message && error.message.includes('Estimated duration')) {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaintToTechnician,
  updateComplaintPriority,
  getRecommendations,
  getComplaintRecommendations,
  getEvaluationSummary,
  getEvaluation, // ← alias so routes that use getEvaluation work
};