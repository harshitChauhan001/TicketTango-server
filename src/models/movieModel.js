const mongoose =require( "mongoose")


const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  genre: { type: [String] },
  releaseDate: { type: Date },
  posterUrl: { type: String },
  director: { type: String },
  cast: { type: [String] },
  duration: { type: Number }, 
  plot: { type: String },
  ratings: {
    imdb: { type: Number },
    metacritic: { type: Number },
    rottenTomatoes: { type: Number }
  }
});

const Movie = mongoose.model("Movie", movieSchema);

module.exports = Movie;
