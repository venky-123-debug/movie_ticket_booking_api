const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
});

module.exports.Rating = mongoose.model('Rating', ratingSchema);
