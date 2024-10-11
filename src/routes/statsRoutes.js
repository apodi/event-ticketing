const express = require('express');
const { getStatistics } = require('../handlers/statsHandler');

const router = express.Router();

router.get('/statistics', getStatistics);

module.exports = router;
