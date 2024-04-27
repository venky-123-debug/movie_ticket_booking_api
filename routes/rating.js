const express = require("express")
const app = express.Router()
const { rating } = require("../models/rating")
const movie = require("../models/movie")
const user = require("../models/user")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")
const { v4: uuidv4 } = require("uuid")

app.post("/", async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId = tokenData.id
    let correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser == null) throw "User not found check token provided"
    let { movieId, ratingWeight } = req.body
    if (!req.body.ratingWeight) throw "Enter a rating"
    if (req.body.ratingWeight !== Number(req.body.ratingWeight)) throw "Rating must be a Number"
    if (req.body.ratingWeight < 1 || req.body.ratingWeight > 5) throw "Rating must be between 1 to 5"

    let thisRating = await rating.findOne({ movieId }, { userId }).lean()
    if (thisRating) throw "User already left a rating"
    let isValidMovie = await movie.findOne({ movieId }).lean()

    if (!isValidMovie) {
      throw "Invalid movieId"
    }
    let ratingId = uuidv4()

    let newRating = await new rating({ movieId, userId, ratingWeight, ratingId, createdAt: Date.now() }).save()
    response.success = true
    response.data = newRating
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.patch("/:id", async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let ratingId = req.params.id

    if (!ratingId) {
      throw "Missing 'id' parameter in the query."
    }
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId = tokenData.id
    let { movieId, ratingWeight } = req.body
    if (!req.body.ratingWeight) throw "Enter a rating"
    if (req.body.ratingWeight !== Number(req.body.ratingWeight)) throw "Rating must be a Number"
    if (req.body.ratingWeight < 1 || req.body.ratingWeight > 5) throw "Rating must be between 1 to 5"

    let correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser === null) throw "Admin not found check token provided"

    let isValidRating = await rating.findOne({ ratingId, userId }).lean()

    if (!isValidRating) {
      throw "Rating not found"
    }
    let isValidMovie = await movie.findOne({ movieId }).lean()
    if (!isValidMovie) {
      throw "Movie not found"
    }

    let updatedRatingData = await rating.findOneAndUpdate({ movieId, userId }, { ratingWeight }, { new: true }).lean()
    if (!updatedRatingData) {
      throw "No movie data found"
    }
    response.success = true
    response.data = updatedRatingData
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})
app.delete("/:id", async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let ratingId = req.params.id

    if (!ratingId) {
      throw "Missing 'id' parameter in the query."
    }
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId = tokenData.id
    let correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser === null) throw "Admin not found check token provided"

    let isValidRating = await rating.findOne({ ratingId, userId }).lean()
    if (!isValidRating) {
      throw "Rating not found"
    }

    let deletedReview = await rating.findOneAndDelete({ ratingId, userId }).lean()
    if (!deletedReview) {
      throw "Rating not found"
    }

    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app
