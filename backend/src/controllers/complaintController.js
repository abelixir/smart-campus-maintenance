const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Location = require('../models/Location');
const User = require('../models/User');
const { calculatePriorityScore } = require('../utils/priorityScore');

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
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority, image, estimatedDuration } = req.body;
    const { severity, safetyRisk, affectedPeople, waitingLevel } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Title, description, category and location are required',
      });
    }

    const isReporter = req.user.role === 'reporter';

    const validatedSeverity = isReporter ? 1 : normalizePriorityValue(severity, 'Severity');
    const validatedSafetyRisk = isReporter ? 1 : normalizePriorityValue(safetyRisk, 'Safety risk');
    const validatedAffectedPeople = isReporter ? 1 : normalizePriorityValue(affectedPeople, 'Affected people');
    const validatedWaitingLevel = isReporter ? 1 : normalizePriorityValue(waitingLevel, 'Waiting level');
    const validatedEstimatedDuration = normalizeEstimatedDuration(estimatedDuration);

    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    let locationDoc = await Location.findOne({ name: location });
    if (!locationDoc) {
      locationDoc = await Location.create({ name: location });
    }

    const computedPriorityScore = calculatePriorityScore({
      severity: validatedSeverity,
      safetyRisk: validatedSafetyRisk,
      affectedPeople: validatedAffectedPeople,
      waitingLevel: validatedWaitingLevel,
    });

    const complaint = await Complaint.create({
      title,
      description,
      category: categoryDoc._id,
      location: locationDoc._id,
      priority: priority || 'Medium',
      severity: validatedSeverity,
      safetyRisk: validatedSafetyRisk,
      affectedPeople: validatedAffectedPeople,
      waitingLevel: validatedWaitingLevel,
      priorityScore: computedPriorityScore,
      estimatedDuration: validatedEstimatedDuration,
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
    if (error.message && error.message.includes('must be a number between 1 and 5')) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message && error.message.includes('Estimated duration')) {
      return res.status(400).json({ message: error.message });
    }

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

// @desc    Get complaints for current user based on role
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

    if (req.user.role === 'reporter' && complaint.reporter?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to view this complaint' });
    }

    if (req.user.role === 'technician' && complaint.assignedTo?._id?.toString() !== req.user._id.toString()) {
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

    const validStatuses = ['Submitted', 'Reviewed', 'Scheduled', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid complaint status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.user.role === 'technician' && complaint.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update complaints assigned to you' });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: req.user._id,
      note: note || `Status updated to ${status}`,
    });

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

    const updatedComplaint = await populateComplaint(Complaint.findById(complaint._id));
    res.status(200).json({
      message: 'Complaint assigned successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

const updateComplaintPriority = async (req, res, next) => {
  try {
    const { severity, safetyRisk, affectedPeople, waitingLevel, estimatedDuration } = req.body;

    if (!['supervisor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only supervisors and admins can update priority assessment' });
    }

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
      note: 'Priority assessment updated by supervisor',
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
};