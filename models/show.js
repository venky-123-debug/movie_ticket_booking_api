const mongoose = require("mongoose")

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: String, required: true },
  theatreId: {type: String},
  screens: [
    {
      _id: false,
      number: { type: String, required: true },
      //movie ID
      currentMovie: { type: String, },
    },
  ],
})

const showSchema = new mongoose.Schema({
  movie: { type: String, ref: "Movie" },
  theatre: { type: String, ref: "Cinema" },
  screenNumber: { type: String, required: true },
  showTime: { type: Date, default: Date.now },
  price: { type: String },
  availableSeats: { type: Number },
})

module.exports.theatre = mongoose.model("Theatre", theatreSchema)
module.exports.show = mongoose.model("Show", showSchema)
