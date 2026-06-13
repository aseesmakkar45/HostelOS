const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gate.controller');

router.post('/verify', gateController.verifyGatePass);

module.exports = router;
