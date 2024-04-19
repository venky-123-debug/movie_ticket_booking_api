const express = require("express")
const user = require("./user")

const app = express.Router()

app.use("/user/", user)

module.exports = app
