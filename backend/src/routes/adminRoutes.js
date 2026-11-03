const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, updateComplaintStatus } = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin', 'supervisor'));
router.get('/dashboard', getDashboardStats);
router.patch('/complaints/:id/status', updateComplaintStatus);

module.exports = router;
