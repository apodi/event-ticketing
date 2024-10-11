const express = require('express');
const eventRoutes = require('./eventRoutes');
const transactionRoutes = require('./transactionRoutes');
const statsRoutes = require('./statsRoutes');

const router = express.Router();

router.use(eventRoutes);
router.use(transactionRoutes);
router.use(statsRoutes);

module.exports = router;