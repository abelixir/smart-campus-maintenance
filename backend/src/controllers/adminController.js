const Complaint = require('../models/Complaint');
const User = require('../models/User');

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalComplaints, resolvedComplaints, pendingComplaints, users] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: { $in: ['Submitted', 'Assigned', 'In Progress'] } }),
      User.find().select('name email role').sort({ createdAt: -1 }),
    ]);

    const categoryCounts = await Complaint.aggregate([
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryData' } },
      { $unwind: '$categoryData' },
      { $group: { _id: '$categoryData.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const statusCounts = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      totals: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        totalUsers: users.length,
      },
      statusCounts,
      categoryCounts,
      users,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role phone department isActive').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const validRoles = ['reporter', 'technician', 'supervisor', 'admin'];

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const validRoles = ['reporter', 'technician', 'supervisor', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUserRole,
};
