const express = require("express")
const app = express.Router()
const user = require("../models/user")
const { v4: uuidv4 } = require("uuid")
const SHA256 = require("crypto-js/sha256")

app.post("/signup", async (req, res) => {
  let response = {}
  response.success = false
  try {
    if (!req.body.email) throw "No email"
    if (!req.body.userName) throw "No userName"
    if (!req.body.password) throw "No password"

    let thisUser = await user.findOne({ email: req.body.email }).lean()

    if (thisUser) throw "User already exists"
  
    let userId = uuidv4()
    console.log(userId)
    let tokenData = {
      id: userId,
    }
    console.log({ tokenData })

    let token = await utilities.generateToken(tokenData, process.env.JWT_SECRET, 86400)
    response.token = token
    response.data = thisUser

    response.success = true
  } catch (error) {
    response = await errorhandler(error, response, req.originalUrl)
  } finally {
    res.json(response)
  }
})

app.post("/login", async (req, res) => {
  let response = {}
  response.success = false
  try {
    if (!req.body.email) throw "No email"
    if (!req.body.userName) throw "No userName"
    if (!req.body.password) throw "No password"

    let thisUser = await user.findOne({ email: req.body.email }).lean()
    if (thisUser == null) throw "No user"
    if (thisUser.password != SHA256(req.body.password).toString()) throw "Invalid password"
    let findBank = await institution.findOne({ institutionId: thisUser.organizationId }).lean()
    console.log({ findBank })
    if (!findBank) throw "No data found with the bank details."
    let tokenData = {
      id: thisUser.userId,
      orgId: thisUser.organizationId,
      bankName: findBank.name,
    }
    console.log({ tokenData })

    let token = await utilities.generateToken(tokenData, process.env.JWT_SECRET, 86400)
    response.token = token
    response.data = thisUser

    response.success = true
  } catch (error) {
    response = await errorhandler(error, response, req.originalUrl)
  } finally {
    res.json(response)
  }
})
module.exports = app