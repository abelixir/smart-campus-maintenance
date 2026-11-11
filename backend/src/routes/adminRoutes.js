const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getUsers, createUser, updateUserRole, deleteUser } = require('../controllers/adminController');

const router = express.Router();

router.use(protect);
router.get('/dashboard', authorize('admin', 'supervisor'), getDashboardStats);
router.get('/users', authorize('admin', 'supervisor'), getUsers);
router.post('/users', authorize('admin'), createUser);
router.patch('/users/:id/role', authorize('admin'), updateUserRole);
router.delete('/users/:id', authorize('admin'), deleteUser);

module.exports = router;
