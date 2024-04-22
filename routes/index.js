const express = require("express")
const user = require("./user")
const admin = require("./admin")
const movie = require("./movie")
const theatre = require("./theatre")

const app = express.Router()

app.use("/user/", user)
app.use("/admin/", admin)
app.use("/movie/", movie)
app.use("/theatre/", theatre)

module.exports = app
