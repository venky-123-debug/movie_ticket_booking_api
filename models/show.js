const mongoose = require("mongoose")

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  theatreId: {type: String},
  screens: [
    {
      _id: false,
      name:{type:String},
      capacity: { type: String, required: true },
      number: { type: String, required: true },
      //movie ID
      currentMovie: { type: String, },
    },
  ],
})

const showSchema = new mongoose.Schema({
  movie: { type: String,required:true },
  theatre:  { type: String,required:true },
  screenNumber: { type: String, required: true },
  showTime: { type: Date, default: Date.now },
  showId:{type:String},
  price: { type: String },
  availableSeats: { type: String },
})

module.exports.theatre = mongoose.model("Theatre", theatreSchema)
module.exports.show = mongoose.model("Show", showSchema)
