const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  bookingId: { type: Number },
  showTimeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShowTime",
    required: true,
  },
  seatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seat",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// compound index for uniqueness of combination of showTimeId and seatId
ticketSchema.index({ showTimeId: 1, seatId: 1 }, { unique: true });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
