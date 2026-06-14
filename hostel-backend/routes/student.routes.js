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
router.post('/student-gatepass', studentController.createStudentGatePass);
router.get('/student-gatepass', studentController.getStudentGatePasses);
router.get('/mess', studentController.getMess);
router.patch('/fees/:id/pay', studentController.payFee);
router.get('/face-status', studentController.getFaceStatus);
router.post('/register-face', studentController.registerFace);
router.get('/ai-suggestions', studentController.getAISuggestions);

module.exports = router;
