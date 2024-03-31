const mongoose = require("mongoose");


const seatSchema = new mongoose.Schema({
  theaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theater",
    required: true,
  },
  seatNumber: { type: Number, required: true },
    rowNumber: { type: Number, required: true },
    seatType: { type: mongoose.Schema.Types.Mixed },
//   type include aisle seat or gold seat or something else 
});

const Seat = mongoose.model("Seat", seatSchema);
module.exports = Seat;
