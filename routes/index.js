const express = require("express")
const user = require("./user")
const admin = require("./admin")
const movie = require("./movie")
const theatre = require("./theatre")
const show = require("./show")
const booking = require("./booking")
const review =require("./review")

const app = express.Router()

app.use("/user/", user)
app.use("/admin/", admin)
app.use("/movie/", movie)
app.use("/theatre/", theatre)
app.use("/show/", show)
app.use("/booking/", booking)
app.use("/review/", review)

module.exports = app
