const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
} = require('../controllers/complaintController');

const router = express.Router();

// All routes below require login
router.use(protect);

// Reporter can create and view their own complaints
router.post('/', createComplaint);
router.get('/my', getMyComplaints);

// Supervisor & Admin can view all complaints
router.get('/', authorize('supervisor', 'admin'), getComplaints);

// Anyone logged in can view a single complaint (we can restrict more later)
router.get('/:id', getComplaintById);

module.exports = router;