const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  userId: { type: String },
})

module.exports = mongoose.model("Admin", adminSchema)
