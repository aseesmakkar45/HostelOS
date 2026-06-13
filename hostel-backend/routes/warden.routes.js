const express = require('express');
const router = Router = express.Router();
const wardenController = require('../controllers/warden.controller');
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/role');

// Protect all warden routes
router.use(authMiddleware, allowRoles('warden'));

router.get('/complaints', wardenController.getComplaints);
router.patch('/complaint/:id', wardenController.updateComplaint);
router.get('/leaves', wardenController.getLeaves);
router.patch('/leave/:id', wardenController.updateLeave);
router.get('/rooms', wardenController.getRooms);

module.exports = router;
