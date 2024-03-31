const express = require("express");
const mongoose = require("mongoose");

const Seat = require("../models/seatModel.js");
const Theater = require("../models/theaterModel.js");
const Ticket = require("../models/ticketModel.js");
const ShowTime = require("../models/showTimeModel.js");

const isTheaterOwner = require("../middlewares/isTheaterOwner.js");
const authenticateToken = require("../middlewares/authenticateToken.js");

const router = express.Router();



router.get("/showTime/:showTimeId", async (req, res) => {
  try {
    const showTimeId = req.params.showTimeId;
    const showTimeDetails = await ShowTime.findOne({ _id: `${showTimeId}` });
    const theaterId = showTimeDetails.theaterId;

    const allSeats = await Seat.find({ theaterId: `${theaterId}` });
    const bookedSeats = await Ticket.find({ showTimeId: `${showTimeId}` })
      .populate("seatId", "seatNumber")
      .select("seatNumber");
    res.json({bookedSeats,allSeats});
   
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/book", authenticateToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;
    const { seatIds, showTimeId } = req.body;

    const seats = await Seat.find({ _id: { $in: seatIds } }).session(session);
    if (seats.length !== seatIds.length) {
      throw new Error("One or more seats do not exist");
    }

    const bookedSeats = await Ticket.find({
      seatId: { $in: seatIds },
      showTimeId: showTimeId,
    }).session(session);
    if (bookedSeats.length > 0) {
      throw new Error("One or more seats are not available for booking");
    }

    const bookings = await Ticket.create(
      seats.map((seat) => ({
        bookingId: 12345, // Change this
        showTimeId: showTimeId,
        seatId: seat._id,
        userId: userId,
      })),
      { session: session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Booking successful.", bookings });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: error.message });
  }
});



router.post("/addSeats/:theaterId", isTheaterOwner, async (req, res) => {
  const { seats } = req.body;
  const theaterId = req.params.theaterId;

  try {
    const theater = await Theater.findOne({
      _id: theaterId,
      ownerId: req.userId,
    });
    if (theater === null) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const newSeats = seats.map((seat) => ({
      theaterId,
      seatNumber: seat.seatNumber,
      rowNumber: seat.rowNumber,
      seatType: seat.seatType,
    }));
    const options = { ordered: true };
    const addedSeats = await Seat.insertMany(newSeats, options);
    return res.status(201).json(addedSeats);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
module.exports = router;
