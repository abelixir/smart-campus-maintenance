const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getUsers, createUser, updateUserRole } = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.get('/dashboard', authorize('admin', 'supervisor'), getDashboardStats);
router.get('/users', authorize('admin'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.patch('/users/:id/role', authorize('admin'), updateUserRole);

module.exports = router;
