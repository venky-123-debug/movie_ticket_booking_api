const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' },
  show: { type: String, ref: 'Show' },
  seats: { type: Array, description: " [String]" },
  totalPrice: {type:String},
  bookedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
