const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  capacity: Number,
  screens: Number,
});

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema' },
  time: Date,
  price: Number,
  availableSeats: Number,
});

module.exports.Cinema = mongoose.model('Cinema', cinemaSchema);
module.exports.Show = mongoose.model('Show', showSchema);
