const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth');
const allowRoles = require('../middleware/role');

// Protect all admin routes
router.use(authMiddleware, allowRoles('admin'));

router.get('/students', adminController.getStudents);
router.post('/allocate', adminController.allocateRoom);
router.get('/fees', adminController.getFees);
router.post('/fee', adminController.addFee);
router.patch('/fee/:id', adminController.updateFee);
router.get('/stats', adminController.getStats);
router.get('/report', adminController.getReport);
router.get('/mess', adminController.getMess);
router.post('/mess', adminController.updateMess);

module.exports = router;
