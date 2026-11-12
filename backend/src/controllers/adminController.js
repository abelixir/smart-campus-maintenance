const Complaint = require('../models/Complaint');
const User = require('../models/User');

const ADMIN_MANAGED_ROLES = ['technician', 'supervisor', 'admin'];
const TECHNICIAN_SKILLS = ['Electrical', 'Plumbing', 'HVAC', 'Cleaning', 'Furniture', 'Security', 'Other'];

const normalizeTechnicianProfile = (rawSkills, rawIsAvailable, rawCurrentWorkload) => {
  const skills = Array.isArray(rawSkills) ? rawSkills : [];
  const validSkills = [...new Set(skills.filter((skill) => TECHNICIAN_SKILLS.includes(skill)))];

  return {
    skills: validSkills,
    isAvailable: rawIsAvailable === undefined ? true : Boolean(rawIsAvailable),
    currentWorkload: Number.isFinite(Number(rawCurrentWorkload)) ? Number(rawCurrentWorkload) : 0,
  };
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [totalComplaints, resolvedComplaints, pendingComplaints, users] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.countDocuments({ status: { $in: ['Submitted', 'Reviewed', 'Scheduled', 'Assigned', 'In Progress'] } }),
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
    const { name, email, password, role, skills, isAvailable, currentWorkload } = req.body;
    const requestedRole = role || 'technician';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!ADMIN_MANAGED_ROLES.includes(requestedRole)) {
      return res.status(400).json({ message: 'Only technician, supervisor, and admin roles can be created by an admin' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const technicianProfile = requestedRole === 'technician'
      ? normalizeTechnicianProfile(skills, isAvailable, currentWorkload)
      : { skills: [], isAvailable: true, currentWorkload: 0 };

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: requestedRole,
      skills: technicianProfile.skills,
      isAvailable: technicianProfile.isAvailable,
      currentWorkload: technicianProfile.currentWorkload,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isAvailable: user.isAvailable,
        currentWorkload: user.currentWorkload,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role, skills, isAvailable, currentWorkload } = req.body;

    if (!ADMIN_MANAGED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Only technician, supervisor, and admin roles can be assigned by an admin' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;

    if (role === 'technician') {
      const technicianProfile = normalizeTechnicianProfile(skills, isAvailable, currentWorkload);
      user.skills = technicianProfile.skills;
      user.isAvailable = technicianProfile.isAvailable;
      user.currentWorkload = technicianProfile.currentWorkload;
    } else {
      user.skills = [];
      user.isAvailable = true;
      user.currentWorkload = 0;
    }

    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        isAvailable: user.isAvailable,
        currentWorkload: user.currentWorkload,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account from the admin panel' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
      message: 'User deleted successfully',
      userId: user._id,
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
  deleteUser,
};
