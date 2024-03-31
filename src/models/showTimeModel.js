const mongoose = require("mongoose");

const showTimeSchema =new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  theaterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Theater",
    required: true,
  },
  dateTime: { type: Date, required: true },
  ticketPrice: { type: Number, required: true },
});

const ShowTime = mongoose.model("ShowTime", showTimeSchema);
module.exports = ShowTime;
