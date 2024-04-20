const express = require("express")
const user = require("./user")
const admin = require("./admin")
const movie = require("./movie")

const app = express.Router()

app.use("/user/", user)
app.use("/admin/", admin)
app.use("/movie/", movie)

module.exports = app
