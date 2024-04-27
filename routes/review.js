const express = require("express")
const app = express.Router()
const { review } = require("../models/review")
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
    const { movieId, content, ratingWeight } = req.body
    if (!req.body.content) throw "Enter a review content"
    if (req.body.ratingWeight) {
      if (req.body.ratingWeight !== Number(req.body.ratingWeight)) throw "Rating must be a Number"
      if (req.body.ratingWeight < 1 || req.body.ratingWeight > 5) throw "Rating must be between 1 to 5"
    }

    let thisReview = await review.findOne({ movieId }, { userId }).lean()
    if (thisReview) throw "User already left a review"
    const isValidMovie = await movie.findOne({ movieId }).lean()

    if (!isValidMovie) {
      throw "Invalid movieId"
    }
    let reviewId = uuidv4()

    let newReview = await new review({ movieId, userId, content, reviewId, ratingWeight, createdAt: Date.now() }).save()
    response.success = true
    response.data = newReview
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
    const reviewId = req.params.id

    if (!reviewId) {
      throw "Missing 'id' parameter in the query."
    }
    const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId = tokenData.id
    let { movieId, content, ratingWeight } = req.body
    if (!req.body.content) throw "Enter a review content"
    if (req.body.ratingWeight) {
      if (req.body.ratingWeight !== Number(req.body.ratingWeight)) throw "Rating must be a Number"
      if (req.body.ratingWeight < 1 || req.body.ratingWeight > 5) throw "Rating must be between 1 to 5"
    }

    const correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser === null) throw "Admin not found check token provided"

    const isValidReview = await review.findOne({ reviewId, userId }).lean()

    if (!isValidReview) {
      throw "Review not found"
    }
    const isValidMovie = await movie.findOne({ movieId }).lean()
    if (!isValidMovie) {
      throw "Movie not found"
    }

    const updatedReviewData = await review
      .findOneAndUpdate(
        { movieId, userId },
        {
          content,
          ratingWeight: req.body.ratingWeight ? req.body.ratingWeight : isValidReview.ratingWeight,
          updatedAt: Date.now(),
        },
        { new: true },
      )
      .lean()
    console.log({ updatedReviewData })

    if (!updatedReviewData) {
      throw "No movie data found"
    }
    response.success = true
    response.data = updatedReviewData
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
    const reviewId = req.params.id

    if (!reviewId) {
      throw "Missing 'id' parameter in the query."
    }
    const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId = tokenData.id
    const correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser === null) throw "Admin not found check token provided"

    const isValidReview = await review.findOne({ reviewId, userId }).lean()

    if (!isValidReview) {
      throw "Review not found"
    }

    const deletedReview = await review.findOneAndDelete({ reviewId, userId }).lean()
    if (!deletedReview) {
      throw "Review not found"
    }

    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app
