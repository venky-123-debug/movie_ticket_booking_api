const mongoose = require("mongoose")

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: String, required: true },
  screens: { type: String, required: true },
})

const showSchema = new mongoose.Schema({
  movie: { type: String, ref: "Movie" },
  theatre: { type: String, ref: "Cinema" },
  time: { type: String, default: Date.now },
  price: { type: String },
  availableSeats: { type: String },
})

module.exports.Cinema = mongoose.model("Cinema", theatreSchema)
module.exports.Show = mongoose.model("Show", showSchema)
