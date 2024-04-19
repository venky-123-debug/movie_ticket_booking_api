const express = require("express")
const user = require("./user")
const movie = require("./movie")

const app = express.Router()

app.use("/user/", user)
app.use("/movie/", movie)

module.exports = app
