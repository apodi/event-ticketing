const express = require('express');
const { addTransaction } = require('../handlers/transactionHandler');

const router = express.Router();

router.post('/transactions', addTransaction);

module.exports = router;
