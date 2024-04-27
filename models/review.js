const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: { type: String, ref: 'Movie' },
  userId: { type: String, ref: 'User' },
  content: {type:String},
  createdAt: { type: String, default: Date.now },
  updatedAt: { type: String },
});

module.exports.review = mongoose.model('Review', reviewSchema);
