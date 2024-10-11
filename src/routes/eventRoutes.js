const express = require('express');
const { createEvent } = require('../handlers/eventHandler');

const router = express.Router();
router.post('/events', createEvent);

module.exports = router;
