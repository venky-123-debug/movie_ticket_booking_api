const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  userId: { type: String },
})

module.exports = mongoose.model("User", userSchema)
