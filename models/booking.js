const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: String, ref: 'User' },
  show: { type: String, ref: 'Show' },
  seats: { type: Array, description: " [String]" },
  totalPrice: {type:String},
  bookingId: {type:String},
  showCancelled: {type:Boolean,default:false},
  bookedDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
