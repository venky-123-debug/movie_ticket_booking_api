const mongoose = require("mongoose");

const actorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }
});

const directorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  genre: { type: [String] },
  releaseDate: { type: Date },
  movieId: { type: String, unique: true },
  duration: { type: String },
  language: { type: String, enum: ['tamil', 'telugu'] },
  director: { type: directorSchema, required: true },
  actors: { type: [actorSchema], required: true },
  poster: { type: String, description: "movie poster" }
});

// Indexes
movieSchema.index({ title: 'text', genre: 1 });

module.exports = mongoose.model("Movie", movieSchema);




// const mongoose = require("mongoose")

// const movieSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String },
//   genre: { type: Array, description: " [String]" },
//   releaseDate: { type: String },
//   movieId: { type: String },
//   duration: { type: String },
//   language: { type: Array ,description: " ['tamil','telugu']"},
//   director: { type: String },
//   actors: { type: Array, description: " [String]" },
//   poster: { type: String, description: "movie poster" },
// })

// module.exports = mongoose.model("Movie", movieSchema)
