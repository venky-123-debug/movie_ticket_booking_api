const express = require("express")
const app = express.Router()
const movie = require("../models/movie")
const admin = require("../models/admin")
const { v4: uuidv4 } = require("uuid")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")
const multer = require("multer")

const upload = multer({ dest: "uploads/" })

app.get("/", async (req, res) => {
  let response = { success: false }
  try {
    let query = {}

    if (req.query.title) {
      const titleRegex = new RegExp(req.query.title, "i")
      query.title = titleRegex
    }

    if (req.query.actor) {
      const actorRegex = new RegExp(req.query.actor, "i")
      query.actors = actorRegex
    }

    if (req.query.director) {
      const directorRegex = new RegExp(req.query.director, "i")
      query.director = directorRegex
    }

    let allMovies = await movie.find(query).lean()
    if (!allMovies.length) throw "No data found"

    response.success = true
    response.data = allMovies
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.get("/:id", async (req, res) => {
  let response = { success: false }

  try {
    const movieId = req.params.id
    if (!movieId) {
      throw "No 'Id' provided in params"
    }
    const thisMovie = await movie.findOne({ movieId }).lean()
    if (!thisMovie) {
      throw "No movie found with these details"
    }
    response.success = true
    response.data = thisMovie
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

// app.post("/newMovie", upload.single("poster"), async (req, res) => {
//   let response = { success: false }
//   try {
//     if (!req.headers["access-token"]) throw "No token"
//     let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
//     console.log("tokenData: ", tokenData)
//     let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
//     if (!correctAdmin || correctAdmin == null) throw "Admin not found check token provided"
//     let existingNewMovie = await movie.findOne({ title: req.body.title }).lean()
//     if (existingNewMovie) throw "movie details already exists"
//     let movieId = uuidv4()
//     let newMovie = await new movie({ ...req.body, poster: req.file ? req.file.filename : "", movieId: movieId }).save()
//     response.success = true
//     response.data = newMovie
//   } catch (error) {
//     response = await errorhandler(error, response)
//   } finally {
//     res.json(response)
//   }
// })

app.post(
  "/newMovie",
  upload.fields([{ name: "poster" }, { name: "actorImages" }, { name: "directorImage" }]),
  async (req, res) => {
    let response = { success: false }
    try {
      if (!req.headers["access-token"]) throw "No token"
      let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
      console.log("tokenData: ", tokenData)
      let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
      if (!correctAdmin || correctAdmin == null) throw "Admin not found check token provided"
      let existingNewMovie = await movie.findOne({ title: req.body.title }).lean()
      if (existingNewMovie) throw "movie details already exists"

      // Handle director image
      const directorImage = req.files["directorImage"] ? req.files["directorImage"][0].filename : ""

      // Handle actor images
      const actorImages = req.files["actorImages"] ? req.files["actorImages"].map((file) => file.filename) : []

      // Ensure each actor object includes name and image
      const actors = req.body.actors.map((actor, index) => ({
        name: actor.name,
        image: actorImages[index] ? actorImages[index] : "",
      }))

      // Ensure director object includes name and image
      const director = {
        name: req.body.director.name,
        image: directorImage ? directorImage : "",
      }

      let movieId = uuidv4()
      let newMovie = await new movie({
        ...req.body,
        poster: req.files["poster"] ? req.files["poster"][0].filename : "",
        movieId: movieId,
        director: director,
        actors: actors,
      }).save()

      response.success = true
      response.data = newMovie
    } catch (error) {
      response = await errorhandler(error, response)
    } finally {
      res.json(response)
    }
  },
)

app.patch("/:id", upload.single("poster"), async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    const movieId = req.params.id

    if (!movieId) {
      throw "Missing 'id' parameter in the query."
    }
    const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    const correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin === null) throw "Admin not found check token provided"

    const existingMovieData = await movie.findOne({ movieId })

    const updateFields = req.file ? { ...req.body, poster: req.file.filename } : req.body

    console.log({ updateFields })

    const updatedMovieData = await movie
      .findOneAndUpdate({ movieId }, { ...existingMovieData._doc, ...updateFields }, { new: true })
      .lean()
    console.log({ updatedMovieData })

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

app.delete("/:id", async (req, res) => {
  let response = { success: false }

  try {
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin == null) throw "Admin not found check token provided"
    const movieId = req.params.id
    if (!movieId) {
      throw "No 'Id' provided in params"
    }
    const thisMovie = await movie.findOneAndDelete({ movieId }).lean()
    if (!thisMovie) {
      throw "No movie found with these details"
    }
    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app
