const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gate.controller');

router.post('/verify', gateController.verifyGatePass);
router.get('/faces', gateController.getRegisteredFaces);
router.post('/verify-face', gateController.verifyFaceEntry);
router.get('/logbook', gateController.getLogBook);

module.exports = router;
