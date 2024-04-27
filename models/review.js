const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
  movieId: { type: String, ref: "Movie" },
  userId: { type: String, ref: "User" },
  content: { type: String, required: true },
  ratingWeight: { type: Number, min: 1, max: 5},
  reviewId: { type: String },
  createdAt: { type: String, default: Date.now },
  updatedAt: { type: String },
})

module.exports.review = mongoose.model("Review", reviewSchema)
