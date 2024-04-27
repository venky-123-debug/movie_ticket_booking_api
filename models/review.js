const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: { type: String, ref: 'Movie' },
  userId: { type: String, ref: 'User' },
  content: {type:String},
  createdAt: { type: Date, default: Date.now },
});

module.exports.Review = mongoose.model('Review', reviewSchema);
