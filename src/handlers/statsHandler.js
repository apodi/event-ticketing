const Transaction = require("../models/Transaction");
const Event = require("../models/Event");
const moment = require("moment");

exports.getStatistics = async (req, res) => {
  try {
    const twelveMonthsAgoTimestamp = moment()
      .subtract(12, "months")
      .startOf("month")
      .valueOf();
    const todayTimestamp = moment().endOf("day").valueOf();

    const statistics = await Event.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgoTimestamp, $lte: todayTimestamp },
        },
      },
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "eventId",
          as: "transactions",
        },
      },
      { $unwind: { path: "$transactions", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          dateAsDate: { $toDate: "$date" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateAsDate" }, 
            month: { $month: "$dateAsDate" }, 
          },
          revenue: { $sum: { $multiply: ["$costPerTicket", "$ticketsSold"] } },
          nEvents: { $sum: 1 },
          totalCapacity: { $sum: "$capacity" },
          totalSold: { $sum: "$ticketsSold" },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          revenue: 1,
          nEvents: 1,
          totalCapacity: 1,
          totalSold: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
