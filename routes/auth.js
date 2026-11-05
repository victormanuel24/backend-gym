const express = require('express');
const controller = require('../controllers/authController');

const router = express.Router();

router.post('/login', controller.login);
router.post('/change-password', controller.requireUser, controller.cambiarPassword);

module.exports = router;