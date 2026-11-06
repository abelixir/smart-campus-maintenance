const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaintToTechnician,
} = require('../controllers/complaintController');

const router = express.Router();

router.use(protect);

router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/', getComplaints);
router.patch('/:id/status', updateComplaintStatus);
router.patch('/:id/assign', assignComplaintToTechnician);
router.get('/:id', getComplaintById);

module.exports = router;