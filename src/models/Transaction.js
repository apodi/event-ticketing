const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  nTickets: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
