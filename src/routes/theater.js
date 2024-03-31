const express = require("express");
const Theater = require("../models/theaterModel.js");
const User = require("../models/userModel.js");
const ShowTime=require("../models/showTimeModel.js")
const session = require("express-session");
const isTheaterOwner = require("../middlewares/isTheaterOwner.js");

const router = express.Router();


const findTheaterOnLocation = async (req, res, location) => {
  try {
    const allTheaters = await Theater.find({ location: {$regex:location, $options:'i'}  });
    return res.status(200).json(allTheaters);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const allTheaterWithoutLocation = async (req, res) => {
  // if user does not have a location or if user wants to see all theaters
  try {
    const allTheaters = await Theater.find();
    return res.status(200).json(allTheaters);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

router.get("/allTheaters", async (req, res) => {
  if (req.session && req.session.userId) {
    const userId = req.session.userId;
    try {
      const user = await User.findOne({ _id: userId });
      const location = user.location;
      if (location === "") {
        return allTheaterWithoutLocation(req, res);
      }
      return findTheaterOnLocation(req, res, location);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  } else {
    return allTheaterWithoutLocation(req, res);
  }
});

router.get("", async (req, res) => {
  const location = req.query.location;
  return findTheaterOnLocation(req, res, location);
});

// as name only contains alphabets as router starts searching from top so it will go into the name part instead of id
// router.get("/:name([a-zA-Z]+)", async (req, res) => {
router.get("/name", async (req, res) => {
  const name = req.query.name;
  try {
    const theater = await Theater.find({
      name: { $regex: name, $options: "i" },
    }).select("name location");

    if (theater.length === 0)
      return res.status(404).json({ message: "NO such Theater" });
    return res.status(200).json(theater);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
// GET route to fetch theaters by movie name and location
router.get("/byMovie", async (req, res) => {
  const { movieId, location } = req.query;
  try {
    const distinctTheaterIds = await ShowTime.distinct("theaterId", { movieId: movieId });
    // Populate theater details for each distinct theaterId
    const theaters = await Theater.find({ _id: { $in: distinctTheaterIds }, location: { $regex:location , $options: 'i' } }).select('address name');
    return res.status(200).json(theaters);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
router.get("/:id", async (req, res) => {
  const theaterId = req.params.id;
  try {
    const theater = await Theater.findById(theaterId);
    if (theater.length === 0) {
      return res.status(404).json({ message: "NO such Theater" });
    } else {

      return res.status(200).json(theater);
    }
  } catch (error) {
    return res.status(400).json({ message: "Invalid ObjectId" });
  }
});




router.post("/createTheater", isTheaterOwner, async (req, res) => {
  try {
    const { name, location, capacity, address } = req.body;
    const ownerId = req.userId;

    const newTheater = new Theater({
      name,
      address,
      location,
      capacity,
      ownerId,
    });
    const savedTheater = await newTheater.save();
    return res.status(201).json(savedTheater);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
