const Event = require('../models/Event');
const Transaction = require('../models/Transaction');

exports.addTransaction = async (req, res) => {
  const session = await Event.startSession();
  session.startTransaction();
  try {
    const { event, nTickets } = req.body;
    const eventData = await Event.findById(event).session(session);

    if (!eventData) {
      throw new Error('Event not found');
    }

    if (eventData.ticketsSold + nTickets > eventData.capacity) {
      throw new Error('Not enough tickets available');
    }

    eventData.ticketsSold += nTickets;
    await eventData.save({ session });

    const transaction = new Transaction({ eventId: event, nTickets });
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ message: 'Transaction added successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
};
