const express = require("express")
const app = express.Router()
const booking = require("../models/booking")
const admin = require("../models/admin")
const { v4: uuidv4 } = require("uuid")
const errorhandler = require("../scripts/error")

app.get("/", async (req, res) => {
  let response = { success: false }
  try {
    let allShows = await show.find().lean()
    if (!allShows.length) throw "No data found"

    response.success = true
    response.data = allShows
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app