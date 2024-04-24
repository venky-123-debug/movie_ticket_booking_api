const express = require("express")
const app = express.Router()
const theatre = require("../models/show").theatre
const show = require("../models/show").show
const admin = require("../models/admin")
const { v4: uuidv4 } = require("uuid")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")

app.get("/", async (req, res) => {
  let response = { success: false }
  try {
    let query = {}

    if (req.query.name) {
      const nameRegex = new RegExp(req.query.name, "i")
      query.name = nameRegex
    }

    if (req.query.location) {
      const locationRegex = new RegExp(req.query.location, "i")
      query.location = locationRegex
    }

    // if (req.query.movie) {
    //   const movieId = req.query.movie;
    //   query['screens.currentMovie'] = movieId; // Filter theaters based on current movie
    // }
    let allTheatres = await theatre.find(query).lean()
    if (!allTheatres.length) throw "No data found"

    response.success = true
    response.data = allTheatres
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.get("/:id", async (req, res) => {
  let response = { success: false }

  try {
    const theatreId = req.params.id
    if (!theatreId) {
      throw "No 'Id' provided in params"
    }
    const thisTheatre = await theatre.findOne({ theatreId }).lean()
    if (!thisTheatre) {
      throw "No theatre found with these details"
    }
    response.success = true
    response.data = thisTheatre
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.post("/newTheatre", async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin == null) throw "Admin not found check token provided"
    let existingNewTheatre = await theatre.findOne({ name: req.body.name },{location:req.body.location}).lean()
    if (existingNewTheatre) throw "Theatre details already exists"
    let theatreId = uuidv4()
    let newTheatre = await new theatre({ ...req.body,  theatreId }).save()
    response.success = true
    response.data = newTheatre
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
    const theatreId = req.params.id

    if (!theatreId) {
      throw "Missing 'id' parameter in the query."
    }
    const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    const correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin === null) throw "Admin not found check token provided"

    const existingTheatreData = await theatre.findOne({ theatreId })

    const updatedTheatreData = await theatre
      .findOneAndUpdate({ theatreId }, { ...existingTheatreData._doc, ... req.body }, { new: true })
      .lean()
    console.log({ updatedTheatreData })

    if (!updatedTheatreData) {
      throw "No theatre data found"
    }
    response.success = true
    response.data = updatedTheatreData
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
    const theatreId = req.params.id
    if (!theatreId) {
      throw "No 'Id' provided in params"
    }
    const thisTheatre = await theatre.findOneAndDelete({ theatreId }).lean()
    if (!thisTheatre) {
      throw "No theatre found with these details"
    }
    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

module.exports = app
