const express = require("express");
const session = require("express-session");

const Ticket = require("../models/ticketModel.js");

const authenticateToken = require("../middlewares/authenticateToken.js");

const router = express.Router();

router.get("/allTickets", authenticateToken, async (req, res) => {
  const userId = req.userId;
  const { showTimeId } = req.query;

  try {
    const allTickets = await Ticket.find({
      userId: `${userId}`,
      showTimeId: `${showTimeId}`,
    })
      .populate({
        path: "showTimeId",
        populate: { path: "theaterId" }, // Populate theater name
      })
      .populate({
        path: "showTimeId",
        populate: { path: "movieId" },
      })
      .populate("seatId", "seatNumber");

    if (allTickets.length === 0) {
      return res.status(404).json({ message: "No Bookings" });
    }
    return res.status(200).json(allTickets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
module.exports = router;
