const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getComplaints,
  createComplaint,
  getComplaintById,
} = require('../controllers/complaintController');

const router = express.Router();

router.use(protect);
router.get('/', getComplaints);
router.post('/', createComplaint);
router.get('/:id', getComplaintById);

module.exports = router;
