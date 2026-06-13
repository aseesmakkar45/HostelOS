const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/role');

// Protect all student routes
router.use(authMiddleware, allowRoles('student'));

router.get('/room', studentController.getRoom);
router.get('/fees', studentController.getFees);
router.post('/complaint', studentController.createComplaint);
router.get('/complaints', studentController.getComplaints);
router.post('/leave', studentController.createLeave);
router.get('/leaves', studentController.getLeaves);
router.post('/gatepass', studentController.createGatePass);
router.get('/gatepasses', studentController.getGatePasses);

module.exports = router;
