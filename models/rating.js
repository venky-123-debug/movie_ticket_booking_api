const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  movieId: { type: String, ref: 'Movie' },
  userId: { type: String, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

module.exports.rating = mongoose.model('Rating', ratingSchema);
