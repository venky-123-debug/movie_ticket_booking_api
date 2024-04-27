const express = require("express")
const app = express.Router()
const { review } = require("../models/review")
const movie = require("../models/movie")
const user = require("../models/user")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")

app.post("/", async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId= tokenData.id 
    let correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser == null) throw "User not found check token provided"
    const { movieId, content } = req.body
    let thisReview = await review.findOne({movieId},{userId}).lean()
    if(thisReview ) throw "User already left a review"
    const isValidMovie = await movie.findOne({ movieId }).lean()

    if (!isValidMovie) {
      throw "Invalid movieId"
    }

    let newReview = await new review({ movieId, userId, content, createdAt: Date.now() }).save()
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
    const movieId = req.params.id

    if (!movieId) {
      throw "Missing 'id' parameter in the query."
    }
    const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let userId = tokenData.id
    const correctUser = await user.findOne({ userId }).lean()
    if (!correctUser || correctUser === null) throw "Admin not found check token provided"

    const isValidMovie = await movie.findOne({ movieId }).lean()

    if (!isValidMovie) {
      throw new Error("Invalid movieId")
    }
    const updatedReviewData = await review
      .findOneAndUpdate(
        { movieId ,userId},
        { content: req.body.content, updatedAt: Date.now() },
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
module.exports = app
