const express = require("express")
const app = express.Router()
const movie = require("../models/movie")
const user = require("../models/user")
const { v4: uuidv4 } = require("uuid")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")
const multer = require("multer")

const upload = multer({ dest: "uploads/" })

app.post("/newMovie", upload.single("poster"), async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    if (tokenData.role != "Admin") throw "Invalid token, check admin credentials while login"
    let correctAdmin = await user.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin == null) throw "admin not found check token provided"
    let existingNewMovie = await movie.findOne({ title: req.body.title }).lean()
    if (existingNewMovie) throw "movie details already exists"
    let movieId = uuidv4()
    let newMovie = await new movie({ ...req.body, poster: req.file ? req.file.filename : "", movieId: movieId }).save()
    response.success = true
    response.data = newMovie
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})
app.patch("/:id", upload.single("poster"), async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    const movieId = req.params.id

    if (!movieId) {
      throw "Missing 'id' parameter in the query."
    }
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    if (tokenData.role != "Admin") throw "Invalid token, check admin credentials while login"
    let correctAdmin = await user.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin == null) throw "admin not found check token provided"

    let existingMovieData = await movie.findOne({ movieId })

    let toUpdateData = {}

    if (req.file) toUpdateData.logo = req.file.filename

    toUpdateData = { ...existingMovieData._doc, ...toUpdateData, ...req.body }
    const updatedMovieData = await movie.findOneAndUpdate({ movieId }, { ...toUpdateData }, { new: true }).lean()

    if (!updatedMovieData) {
      throw "No movie data found"
    }
    response.success = true
    response.data = updatedMovieData
  
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app
