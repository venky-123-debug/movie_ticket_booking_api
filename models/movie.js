const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  genre: { type: Array, description: " [String]" },
  releaseDate: { type: String },
  movieId: { type: String },
  duration: { type: String },
  language: { type: Array ,description: " ['tamil','telugu']"},
  director: { type: String },
  actors: { type: Array, description: " [String]" },
  poster: { type: String, description: "movie poster" },
})

module.exports = mongoose.model("Movie", movieSchema)
