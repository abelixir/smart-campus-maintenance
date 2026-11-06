const Complaint = require('../models/Complaint');
const Category = require('../models/Category');
const Location = require('../models/Location');

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, location, priority, image } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({
        message: 'Title, description, category and location are required',
      });
    }

    // Find or create Category
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category });
    }

    // Find or create Location
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

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email');

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
    const complaints = await Complaint.find({ reporter: req.user._id })
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (for supervisor/admin)
// @route   GET /api/complaints
// @access  Private (supervisor, admin)
const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

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
    const complaint = await Complaint.findById(req.params.id)
      .populate('category', 'name')
      .populate('location', 'name')
      .populate('reporter', 'name email')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.changedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json(complaint);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
};