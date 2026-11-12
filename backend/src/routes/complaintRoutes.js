const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaintToTechnician,
  updateComplaintPriority,
  getComplaintRecommendations,
} = require('../controllers/complaintController');

const router = express.Router();

router.use(protect);

router.post('/', authorize('reporter'), createComplaint);
router.get('/my', authorize('reporter'), getMyComplaints);
router.get('/', authorize('reporter', 'technician', 'supervisor', 'admin'), getComplaints);
router.get('/recommendations', authorize('supervisor', 'admin'), getComplaintRecommendations);
router.post('/generate-schedule', authorize('supervisor', 'admin'), getComplaintRecommendations);
router.patch('/:id/status', authorize('technician', 'supervisor', 'admin'), updateComplaintStatus);
router.patch('/:id/assign', authorize('supervisor', 'admin'), assignComplaintToTechnician);
router.patch('/:id/priority', authorize('supervisor', 'admin'), updateComplaintPriority);
router.get('/:id', authorize('reporter', 'technician', 'supervisor', 'admin'), getComplaintById);

module.exports = router;