const express = require("express")
const app = express.Router()
const booking = require("../models/booking")
const user = require("../models/user")
const seat = require("../models/seat")
const { v4: uuidv4 } = require("uuid")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")
const show = require("../models/show").show

app.get("/", async (req, res) => {
  let response = { success: false }
  try {
    let allBooking = await booking.find().lean()
    if (!allBooking.length) throw "No data found"
    response.success = true
    response.data = allBooking
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.get("/:id", async (req, res) => {
  let response = { success: false }

  try {
    const bookingId = req.params.id
    if (!bookingId) {
      throw "No 'Id' provided in params"
    }
    const thisBooking = await booking.findOne({ bookingId }).lean()
    if (!thisBooking) {
      throw "No show found with these details"
    }
    response.success = true
    response.data = thisBooking
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

// app.post("/newBooking", async (req, res) => {
//   let response = { success: false }
//   try {
//     if (!req.headers["access-token"]) throw "No token"
//     let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
//     console.log("tokenData: ", tokenData)
//     let correctUser = await user.findOne({ userId: tokenData.id }).lean()
//     if (!correctUser || correctUser == null) throw "User not found check token provided"
//     let bookingId = uuidv4()
//     let newBooking = await new booking({ ...req.body, bookingId,user:tokenData.id }).save()
//     response.success = true
//     response.data = newBooking
//   } catch (error) {
//     response = await errorhandler(error, response)
//   } finally {
//     res.json(response)
//   }
// })

app.post("/reserve", async (req, res) => {
  let response = { success: false }
  try {
    // Authenticate user
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let correctUser = await user.findOne({ userId: tokenData.id }).lean()
    if (!correctUser || correctUser == null) throw "User not found check token provided"

    const { show: showId, seats: selectedSeats } = req.body
    console.log("req.body", req.body)
    const thisShow = await show.findOne({ showId }).lean()
    if (!thisShow) throw "Show not found"

    // Create array to store reserved seats
    const reservedSeats = []

    // Iterate through selected seats and update reservation status
    for (let i = 0; i < selectedSeats.length; i++) {
      const thisSeat = await seat.findOne({ show: showId, number: selectedSeats[i], reserved: true }).lean()
      if (thisSeat) {
        throw `Seat number ${selectedSeats[i]} already reserved by another user`
      }
      const newSeat = new seat({
        show: showId,
        number: selectedSeats[i],
        reserved: true,
        userId: tokenData.id,
        reservedAt: Date.now(),
      })
      const savedSeat = await newSeat.save()
      reservedSeats.push(savedSeat)
    }

    response.success = true
    response.data = reservedSeats
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.post("/confirmBooking", async (req, res) => {
  let response = { success: false }
  try {
    // Authenticate user
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let correctUser = await user.findOne({ userId: tokenData.id }).lean()
    if (!correctUser || correctUser == null) throw "User not found check token provided"

    // Validate input
    const { show: showId, seats: selectedSeats } = req.body

    const bookedSeats = await seat.find({ show: showId, number: { $in: selectedSeats }, bookingId: { $ne: null } });
    if (bookedSeats.length > 0) {
      throw "One or more selected seats are already booked";
    }

    // Check if the selected seats are already reserved by the user
    for (let i = 0; i < selectedSeats.length; i++) {
      const thisSeat = await seat
        .findOne({ show: showId, userId: tokenData.id, number: selectedSeats[i], reserved: true })
        .lean()
      if (!thisSeat) {
        throw `Seat number ${selectedSeats[i]} not reserved by you.`
      }
    }

    // Create booking
    const bookingId = uuidv4()
    // Mark reserved seats as booked
    for (const seatNumber of selectedSeats) {
      const reservedSeat = await seat.findOneAndUpdate(
        { show: showId, number: seatNumber, reserved: true },
        { bookingId },
        { new: true },
      )
      if (!reservedSeat) {
        throw `Seat number ${seatNumber} is not reserved or already booked`
      }
    }
    const newBooking = await new booking({ show: showId, seats: selectedSeats, bookingId, user: tokenData.id }).save()


    // Respond with success and booking details
    response.success = true
    response.data = newBooking
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app
