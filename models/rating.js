const mongoose = require("mongoose")

const ratingSchema = new mongoose.Schema({
  movieId: { type: String, ref: "Movie" },
  userId: { type: String, ref: "User" },
  ratingWeight: { type: Number, min: 1, max: 5, required: true },
  createdAt: { type: Date, default: Date.now },
  ratingId: { type: String },
})

module.exports.rating = mongoose.model("Rating", ratingSchema)
