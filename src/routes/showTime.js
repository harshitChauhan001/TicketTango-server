const express = require("express");
const session = require("express-session");

const ShowTime = require("../models/showTimeModel.js");
const Ticket = require("../models/ticketModel.js");
const Theater = require("../models/theaterModel.js");

const isTheaterOwner = require("../middlewares/isTheaterOwner.js");
const Movie = require("../models/movieModel.js");
const authenticateToken = require("../middlewares/authenticateToken.js");

const router = express.Router();

//    PAGINATION IS SHOWS ARE MORE THAN 10 OR SOMETHING LIKE THAT


router.get("/allShows", async (req, res) => {
  try {
    const currentDate = new Date();

    // Use theaterId instead of location directly
    const theaterFilter = {};
    if (req.session.location && req.session.location !== "") {
      const theaters = await Theater.find({ location: req.session.location });
      const theaterIds = theaters.map((theater) => theater._id);
      theaterFilter.theaterId = { $in: theaterIds };
    }
    const allShows = await ShowTime.find({
      ...theaterFilter,
      dateTime: { $gte: currentDate },
    });
    if (allShows.length === 0) {
      return res.status(404).json({ message: "No Shows" });
    } else {
      return res.status(200).json(allShows);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get("/allShows/:location", async (req, res) => {
  const location = req.params.location;
  try {
    const theaters = await Theater.find({ location: location });
    if (theaters.length === 0) {
      return res.status(404).json({ message: "No Shows" });
    }

    const theaterIds = theaters.map((theater) => theater._id);
    const allShows = await ShowTime.find({
      theaterId: { $in: theaterIds },
    });

    if (allShows.length === 0) {
      return res.status(404).json({ message: "No Shows" });
    } else {
      return res.status(200).json(allShows);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
// previously watched shows
router.get("/previouslyWatched", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userTickets = await Ticket.find({ userId: `${userId}` });

    const showTimeIds = userTickets.map((ticket) => ticket.showTimeId);
    const previouslyWatchedShows = await ShowTime.find({
      _id: { $in: showTimeIds },
      dateTime: { $lte: new Date() },
    })
      .populate("movieId", "title")
      .populate("theaterId", "name")
      .select("dateTime theaterId");
    if (previouslyWatchedShows.length === 0) {
      return res.status(404).json({ message: "No previously Watched Shows" });
    }
    return res.status(200).json(previouslyWatchedShows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get("/upcomingShows", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userTickets = await Ticket.find({ userId: `${userId}` });
    const showTimeIds = userTickets.map((ticket) => {
      return ticket.showTimeId;
    });
    const upcomingShows = await ShowTime.find({
      _id: { $in: showTimeIds },
      dateTime: { $gte: new Date() },
    })
      .populate("movieId", "title")
      .populate("theaterId", "name")
      .select("dateTime theaterId");
    if (upcomingShows.length === 0) {
      return res
        .status(404)
        .json({ message: "No upcoming Shows for the user" });
    }

    const upcomingShowsWithSeatNumber = await Promise.all(
      upcomingShows.map(async (show) => {
        const seatNumbers = await Ticket.find({
          userId: userId,
          showTimeId: show._id,
        }).populate("seatId", "seatNumber");
        return { show, seatNumbers };
      })
    );
    return res.status(200).json(upcomingShowsWithSeatNumber);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
});
router.get("/theater/:theaterId", async (req, res) => {
  const theaterId = req.params.theaterId;
  try {
    const allShowsForTheater = await ShowTime.find({
      theaterId: `${theaterId}`,
    });
    if (allShowsForTheater.length === 0) {
      return res.status(404).json({ message: "No Shows" });
    } else {
      return res.status(200).json(allShowsForTheater);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get("/:theaterId/movies", async (req, res) => {
  const theaterId = req.params.theaterId;

  try {
    // Find distinct movie IDs for the given theater
    const distinctMovieIds = await ShowTime.distinct("movieId", {
      theaterId,
      dateTime: { $gte: new Date() },
    });

    const movies = await Promise.all(
      distinctMovieIds.map(async (movieId) => {
        const movie = await Movie.findById(movieId);
        return movie;
      })
    );
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:theaterId/:movieId", async (req, res) => {
  console.log("imposter");
  const theaterId = req.params.theaterId;
  const movieId = req.params.movieId;
  try {
    const allShowsForTheater = await ShowTime.find({
      theaterId: `${theaterId}`,
      movieId: `${movieId}`,
      dateTime: { $gte: new Date() },
    });
    if (allShowsForTheater.length === 0) {
      return res.status(404).json({ message: "No Shows" });
    } else {
      return res.status(200).json(allShowsForTheater);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get(
  "/:theaterId/by-date-range/:startDate/:endDate",
  async (req, res) => {
    const theaterId = req.params.theaterId;
    const startDate = req.params.startDate;
    const endDate = req.params.endDate;

    try {
      const allShows = await ShowTime.find({
        theaterId: `${theaterId}`,
        dateTime: { $gte: startDate, $lte: endDate },
      });
      if (allShows.length === 0) {
        return res.status(404).json({ message: "No Shows" });
      } else {
        return res.status(200).json(allShows);
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
);
router.get("/:showTimeId", async (req, res) => {
  try {
    const showTimeId = req.params.showTimeId;
    const showTime = await ShowTime.findById(showTimeId)
      .populate("movieId", "title")
      .populate("theaterId", "name address");

    if (!showTime) {
      return res.status(404).json({ message: "Showtime not found" });
    }
    const { dateTime, ticketPrice, movieId, theaterId } = showTime;
    const movieTitle = movieId.title;
    const theaterName = theaterId.name;
    const theaterLocation = theaterId.address;

    const response = {
      dateTime,
      ticketPrice,
      movieTitle,
      theaterName,
      theaterLocation,
    };
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/api/showTimes", isTheaterOwner, async (req, res) => {
  try {
    const { theaterId, movieName, dateTime, ticketPrice } = req.body;
    const isUserOwnerOfTheater = await Theater.findOne({
      _id: theaterId,
      ownerId: req.userId,
      // ownerId: req.session.userId,
    });
    if (isUserOwnerOfTheater === null) {
      return res.status(401).json({
        message: "You cannot add shows to this theater As you are not owner",
      });
    }

    const movie = await Movie.findOne({ title: `${movieName}` });
    const movieId = movie._id;
    const newShowTime = new ShowTime({
      movieId,
      theaterId,
      dateTime,
      ticketPrice,
    });

    const savedShowTime = await newShowTime.save();

    res.status(201).json(savedShowTime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
