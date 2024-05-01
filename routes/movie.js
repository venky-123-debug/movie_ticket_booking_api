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
  upload.fields([{ name: "poster" }, { name: "actorImages" }, { name: "crewImages" }]),
  async (req, res) => {
    let response = { success: false }
    try {
      if (!req.headers["access-token"]) throw "No token"
      let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
      let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
      if (!correctAdmin || correctAdmin == null) throw "Admin not found check token provided"
      let existingMovie = await movie.findOne({ title: req.body.title }).lean()
      if (existingMovie) throw "Movie details already exist"

      // Extract image filenames from the uploaded files
      const poster = req.files["poster"] ? req.files["poster"][0].filename : ""
      const actorImages = req.files["actorImages"] ? req.files["actorImages"].map((file) => file.filename) : []
      const crewImages = req.files["crewImages"] ? req.files["crewImages"].map((file) => file.filename) : []

      // Parse the JSON strings for actors and crew
      const actors = JSON.parse(req.body.actors)
      const crew = JSON.parse(req.body.crew)

      // Create an array of actor objects with names and images
      const actorsWithImages = actors.map((actor, index) => ({
        name: actor.name,
        image: actorImages[index] || "", // Use empty string if image is missing
      }))

      // Create an array of crew objects with names, roles, and images
      const crewWithImages = crew.map((crewMember, index) => ({
        name: crewMember.name,
        role: crewMember.role,
        image: crewImages[index] || "", // Use empty string if image is missing
      }))

      // Create a new movie object using the Movie model
      const newMovie = await new movie({
        title: req.body.title,
        description: req.body.description,
        genre: req.body.genre,
        releaseDate: req.body.releaseDate,
        duration: req.body.duration,
        language: req.body.language,
        poster: poster,
        actors: actorsWithImages,
        crew: crewWithImages,
      })
      newMovie.save()

      response.success = true
      response.data = newMovie
    } catch (error) {
      response = await errorhandler(error, response)
    } finally {
      res.json(response)
    }
  },
)

// app.post(
//   "/newMovie",
//   upload.fields([{ name: "poster" }, { name: "actorImages" }, { name: "crewImages" }]),
//   async (req, res) => {
//     let response = { success: false }
//     try {
//       if (!req.headers["access-token"]) throw "No token"
//       let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
//       let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
//       if (!correctAdmin || correctAdmin == null) throw "Admin not found check token provided"
//       let existingNewMovie = await movie.findOne({ title: req.body.title }).lean()
//       if (existingNewMovie) throw "Movie details already exist"

//       // Handle director image
//       const crewImages = req.files["crewImages"] ? req.files["crewImages"].map((file) => file.filename) : []

//       // Handle actor images
//       const actorImages = req.files["actorImages"] ? req.files["actorImages"].map((file) => file.filename) : []

//       console.log(req.body, req.files)

//       // Ensure actors array is parsed correctly
//       let actors = []
//       let crew = []
//       try {
//         actors = JSON.parse(req.body.actors)
//       } catch (error) {
//         throw "Error parsing actors array"
//       }

//       // Ensure each actor object includes name and image
//       const actorsWithImages = actors.map((actor, index) => ({
//         name: actor.name,
//         image: actorImages[index] ? actorImages[index] : "",
//       }))

//       // Ensure director object includes name and image
//       const crewWithImages = crew.map((crew, index) => ({
//         name: crew.name,
//         role: crew.role,
//         image: crewImages[index] ? crewImages[index] : "",
//       }))
//       // console.log(typeof req.body.language)
//       let movieId = uuidv4()
//       // let movieLanguages = JSON.parse(req.body.language)
//       let newMovie = await new movie({
//         ...req.body,
//         poster: req.files["poster"] ? req.files["poster"][0].filename : "",
//         movieId: movieId,
//         language: req.body.language,
//          // genre: req.body.genre,
//         crew: crewWithImages,
//         actors: actorsWithImages,
//       }).save()

//       response.success = true
//       response.data = newMovie
//     } catch (error) {
//       response = await errorhandler(error, response)
//     } finally {
//       res.json(response)
//     }
//   },
// )

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
