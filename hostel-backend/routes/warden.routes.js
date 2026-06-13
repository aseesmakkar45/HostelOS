const express = require('express');
const router = express.Router();
const wardenController = require('../controllers/warden.controller');
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/role');

// Staff routes are accessible by both warden and admin roles
router.get('/staff', authMiddleware, allowRoles('warden', 'admin'), wardenController.getStaff);
router.post('/staff', authMiddleware, allowRoles('warden', 'admin'), wardenController.createStaff);

// Protect all other warden routes
router.use(authMiddleware, allowRoles('warden'));

router.get('/complaints', wardenController.getComplaints);
router.patch('/complaint/:id', wardenController.updateComplaint);
router.get('/leaves', wardenController.getLeaves);
router.patch('/leave/:id', wardenController.updateLeave);
router.get('/rooms', wardenController.getRooms);

// Newly added endpoints for full linkage
router.get('/residents', wardenController.getResidents);
router.get('/fees', wardenController.getFees);
router.get('/passes', wardenController.getPasses);
router.patch('/pass/:id', wardenController.updatePass);
router.get('/insights', wardenController.getAIInsights);

module.exports = router;
