const express = require("express");
const Movie = require("../models/movieModel");

const router = express.Router();

// ADD WHICH FIELDS SHOULD NOT BE EMPTY IN THE MODELS . see edge cases for search operation and other things


// get all movies
router.get("/allMovies", async (req, res) => {
  try {
    const allMovies = await Movie.find({ releaseDate: { $gte: new Date() } })
    .select('title genre posterUrl ratings');
    return res.status(200).json(allMovies);
  } catch (error) {
    console.log("Error fetching all movies", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// find a particular movie based on id
router.get("/:id", async (req, res) => {
  const movieId = req.params.id;
  try {
    const movie = await Movie.findById(movieId);
    if (movie == null) {
      return res.status(404).json({ message: "NO such movie" });
    } else return res.status(200).json(movie);
  } catch (error) {
    return res.status(400).json({ message: "Invalid ObjectId" });
  }
});

// movie name search and genre filter
router.get("", async (req, res) => {
  const movieName = req.query.name;
  const allGenre = req.query.genre;

  if (movieName) {
    try {
      const movie = await Movie.find({ title:{ $regex: movieName ,$options: 'i'} }).select('title');
      if (!movie) {
        return res.status(404).json({ message: "No such movie" });
      }
      return res.status(200).json(movie);
    } catch (error) {
      console.log("Internal Server Error", error);
      return res.status(500).json({ message: error.message });
    }
  } else {
    if (allGenre.trim() !== "") {
      const movieGenres = allGenre.split(",");
      // if no genre

      try {
        const movies = await Movie.find({ genre: { $all: movieGenres } ,releaseDate: { $gte: new Date() } })
          .select("title genre posterUrl ratings");

        return res.status(200).json(movies);
      } catch (error) {
        console.log("Internal server Error", error);
        return res.status(500).json({ message: error });
      }
    } else {
      try {
        const movies = await Movie.find({releaseDate: { $gte: new Date() } }).select("title genre posterUrl ratings");
        return res.status(200).json(movies);
      } catch (error) {
        console.log("Internal server Error", error);
        return res.status(500).json({ message: error });
      }
    }
  }
});


router.post("/addMovie", async (req, res) => {
  try {
    const { title, genres, releaseDate, posterUrl } = req.body;
    const genre = genres.split(",").map((genre) => genre.trim());

    const newMovie = new Movie({
      title,
      genre,
      releaseDate,
      posterUrl,
    });
    const addedMovie = await newMovie.save();
    return res.status(201).json(addedMovie);
    
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
