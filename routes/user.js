const express = require("express")
const app = express.Router()
const user = require("../models/user")
const { v4: uuidv4 } = require("uuid")
const SHA256 = require("crypto-js/sha256")
const utilities = require("../scripts/utilities")
const errorhandler = require("../scripts/error")

app.post("/signup", async (req, res) => {
  let response = {}
  response.success = false
  try {
    if (!req.body.email) throw "No email"
    if (!req.body.password) throw "No password"

    if (!utilities.emailAddressPattern.test(req.body.email)) throw "Invalid email address"
    let thisUser = await user.findOne({ email: req.body.email }).lean()
    if (thisUser) throw "User already exists"

    let userId = uuidv4()
    console.log(userId)

    let newUser = await new user({ ...req.body, password: SHA256(req.body.password).toString(), userId: userId }).save()

    response.data = newUser
    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})

app.post("/login", async (req, res) => {
  let response = {}
  response.success = false
  try {
    if (!req.body.email) throw "No email"
    if (!req.body.password) throw "No password"
    
    if (!utilities.emailAddressPattern.test(req.body.email)) throw "Invalid email address"
    let thisUser = await user.findOne({ email: req.body.email }).lean()
    if (thisUser == null) throw "No user"

    console.log({ thisUser })
    if (thisUser.password != SHA256(req.body.password).toString()) throw "Invalid password"

    let tokenData = {
      id: thisUser.userId
    }
    console.log({ tokenData })

    let token = await utilities.generateToken(tokenData, process.env.JWT_SECRET, 86400)
    response.token = token
    response.data = thisUser
    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})
module.exports = app
