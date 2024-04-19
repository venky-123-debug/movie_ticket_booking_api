const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  userId: { type: String },
  //role as admin or user
  role: { type: String, required: true, default: "user" },
})

module.exports = mongoose.model("User", userSchema)
