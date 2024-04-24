const express = require("express")
const app = express.Router()
const admin = require("../models/admin")
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
    let thisAdmin = await admin.findOne({ email: req.body.email }).lean()
    if (thisAdmin) throw "Admin already exists"

    let adminId = uuidv4()
    console.log(adminId)

    let newAdmin = await new admin({ ...req.body, password: SHA256(req.body.password).toString(), userId: adminId }).save()

    response.data = newAdmin
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
    
    let thisAdmin = await admin.findOne({ email: req.body.email }).lean()
    if (thisAdmin == null) throw "No admin found"

    console.log({ thisAdmin })
    if (thisAdmin.password != SHA256(req.body.password).toString()) throw "Invalid password"

    let tokenData = {
      id: thisAdmin.userId
    }
    console.log({ tokenData })

    let token = await utilities.generateToken(tokenData, process.env.JWT_SECRET, 86400)
    response.token = token
    response.data = thisAdmin
    response.success = true
  } catch (error) {
    response = await errorhandler(error, response)
  } finally {
    res.json(response)
  }
})
module.exports = app
