const mongoose = require("mongoose")

const actorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  _id: false,
})

const crewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  role: { type: String, required: true },
  _id: false,
})

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  genre: { type: String },
  language: { type: String },
  Certification: { type: String },
  releaseDate: { type: Date },
  movieId: { type: String, unique: true },
  duration: { type: String },
  crew: { type: [crewSchema], required: true },
  actors: { type: [actorSchema], required: true },
  poster: { type: String, description: "movie poster" },
})

module.exports = mongoose.model("Movie", movieSchema)
