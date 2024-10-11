const Event = require("../models/Event");
const moment = require('moment');

exports.createEvent = async (req, res) => {
  try {
    let dateInTimestamp = ''
    const { name, date, capacity, costPerTicket } = req.body;
    if (typeof date === "string") {
       dateInTimestamp = moment(date, "DD/MM/YYYY").valueOf();
    }
    const event = new Event({ name, date: dateInTimestamp, capacity, costPerTicket });
    await event.save();

    res.status(201).json({ eventId: event._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
