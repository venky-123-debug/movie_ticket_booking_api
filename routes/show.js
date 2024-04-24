const express = require("express")
const app = express.Router()
const show = require("../models/show").show
const admin = require("../models/admin")
const { v4: uuidv4 } = require("uuid")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")

app.get("/", async (req, res) => {
  let response = { success: false }
  try {
    let query = {}

    if (req.query.theatre) {
      const theatreRegex = new RegExp(req.query.theatre, "i")
      query.theatre = theatreRegex
    }
    let allShows = await show.find(query).lean()
    if (!allShows.length) throw "No data found"

    response.success = true
    response.data = allShows
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.get("/:id", async (req, res) => {
  let response = { success: false }

  try {
    const showId = req.params.id
    if (!showId) {
      throw "No 'Id' provided in params"
    }
    const thisShow = await show.findOne({ showId }).lean()
    if (!thisShow) {
      throw "No show found with these details"
    }
    response.success = true
    response.data = thisShow
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.post("/newShow", async (req, res) => {
  let response = { success: false }
  try {
    if (!req.headers["access-token"]) throw "No token"
    let tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    let correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin == null) throw "admin not found check token provided"
    // let existingNewTheatre = await show.findOne({ name: req.body.name },{location:req.body.location}).lean()
    // if (existingNewTheatre) throw "Theatre details already exists"
    let showId = uuidv4()
    let newTheatre = await new show({ ...req.body,  showId }).save()
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
    const showId = req.params.id

    if (!showId) {
      throw "Missing 'id' parameter in the query."
    }
    const tokenData = await utilities.verifyToken(req.headers["access-token"], process.env.JWT_SECRET)
    console.log("tokenData: ", tokenData)
    const correctAdmin = await admin.findOne({ userId: tokenData.id }).lean()
    if (!correctAdmin || correctAdmin === null) throw "admin not found check token provided"

    const existingShowData = await show.findOne({ showId })

    const updatedShowData = await show
      .findOneAndUpdate({ showId }, { ...existingShowData._doc, ... req.body }, { new: true })
      .lean()
    console.log({ updatedShowData })

    if (!updatedShowData) {
      throw "No show data found"
    }
    response.success = true
    response.data = updatedShowData
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
    if (!correctAdmin || correctAdmin == null) throw "admin not found check token provided"
    const showId = req.params.id
    if (!showId) {
      throw "No 'Id' provided in params"
    }
    const thisShow = await show.findOneAndDelete({ showId }).lean()
    if (!thisShow) {
      throw "No show found with these details"
    }
    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})
module.exports = app