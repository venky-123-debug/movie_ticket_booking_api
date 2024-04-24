const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  show: { type: String, ref: 'Show', required: true },
  number: { type: String, required: true },
  userId: { type: String, ref: 'User', default: null },
  reserved: { type: Boolean, default: false },
  reservedAt: { type: Date, default: Date.now },
  bookingId: { type: String, ref: 'Booking', default: null } // Reference to Booking schema

});

module.exports = mongoose.model('Seat', seatSchema);
