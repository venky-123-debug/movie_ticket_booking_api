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

      const poster = req.files["poster"] ? req.files["poster"][0].filename : ""
      const actorImages = req.files["actorImages"] ? req.files["actorImages"].map((file) => file.filename) : []
      const crewImages = req.files["crewImages"] ? req.files["crewImages"].map((file) => file.filename) : []

      // Ensure that actors and crew are arrays
      const actors = Array.isArray(req.body.actors) ? req.body.actors : [req.body.actors]
      const crew = Array.isArray(req.body.crew) ? req.body.crew : [req.body.crew]

      // Validate that all required fields are present for actors and crew
      for (const actor of actors) {
        if (!actor.name) throw new Error("Actor name is required")
      }
      for (const crewMember of crew) {
        if (!crewMember.name || !crewMember.role) throw new Error("Crew member name and role are required")
      }

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

      let movieId = uuidv4()
      // Create a new movie object using the Movie model
      const newMovie = await new movie({
        ...req.body,
        poster,
        movieId: movieId,
        crew: crewWithImages,
        actors: actorsWithImages,
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

// app.patch("/:id", upload.single("poster"), async (req, res) => {
//   let response = { success: false }
//   try {
//     if (!req.headers["access-token"]) throw "No token"
//     const movieId = req.params.id

//     if (!movieId) {
//       throw "Missing 'id' parameter in the query."
//     }
//     const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
//     console.log("tokenData: ", tokenData)
//     const correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
//     if (!correctAdmin || correctAdmin === null) throw "Admin not found check token provided"

//     const existingMovieData = await movie.findOne({ movieId })

//     const updateFields = req.file ? { ...req.body, poster: req.file.filename } : req.body

//     console.log({ updateFields })

//     const updatedMovieData = await movie
//       .findOneAndUpdate({ movieId }, { ...existingMovieData._doc, ...updateFields }, { new: true })
//       .lean()
//     console.log({ updatedMovieData })

//     if (!updatedMovieData) {
//       throw "No movie data found"
//     }
//     response.success = true
//     response.data = updatedMovieData
//   } catch (error) {
//     response = await errorhandler(error, response)
//   } finally {
//     res.json(response)
//   }
// })

app.patch("/:id", upload.fields([{ name: "poster" }, { name: "actorImages" }, { name: "crewImages" }]), async (req, res) => {
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

    const existingMovieData = await movie.findOne({ movieId }).lean()

    const updateFields = req.files ? {
      ...req.body,
      poster: req.files["poster"] ? req.files["poster"][0].filename : existingMovieData.poster,
    } : req.body

    // Handle actors and crew updates
    const actorImages = req.files["actorImages"] ? req.files["actorImages"].map((file) => file.filename) : existingMovieData.actors.map(actor => actor.image)
    const crewImages = req.files["crewImages"] ? req.files["crewImages"].map((file) => file.filename) : existingMovieData.crew.map(crew => crew.image)

    const actors = Array.isArray(req.body.actors) ? req.body.actors : existingMovieData.actors.map(actor => actor.name)
    const crew = Array.isArray(req.body.crew) ? req.body.crew : existingMovieData.crew.map(crew => ({ name: crew.name, role: crew.role }))

    // Validate actors and crew
    for (const actor of actors) {
      if (!actor.name) throw new Error("Actor name is required")
    }
    for (const crewMember of crew) {
      if (!crewMember.name || !crewMember.role) throw new Error("Crew member name and role are required")
    }

    const actorsWithImages = actors.map((actor, index) => ({
      name: actor.name,
      image: actorImages[index] || "", // Use existing image if not updated
    }))

    const crewWithImages = crew.map((crewMember, index) => ({
      name: crewMember.name,
      role: crewMember.role,
      image: crewImages[index] || "", // Use existing image if not updated
    }))

    const updatedMovieData = await movie
      .findOneAndUpdate({ movieId }, { ...req.body, actors: actorsWithImages, crew: crewWithImages }, { new: true })
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
