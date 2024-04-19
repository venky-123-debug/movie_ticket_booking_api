const mongoose = require("mongoose")
const express = require("express")
const app = express()
const morgan = require("morgan")
const cors = require("cors")
require("dotenv").config()

app.use(cors())
app.use(
  express.urlencoded({
    extended: true,
  }),
)
app.use(express.json())
app.use(morgan("dev"))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN)
  res.header("Access-Control-Allow-Methods", "GET, POST,PATCH, HEAD")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token")
  res.header("Cache-Control", "no-store")
  res.header("Pragma", "no-cache")
  res.header("X-XSS-Protection", "1; mode=block")
  res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  next()
})
const routes = require("./routes/index")
app.use("/", routes)

app.get("/", async (req, res) => {
  res.send("Hello world")
})
app.get("/files/:fileName", async (req, res) => {
  res.sendFile(__dirname + "/uploads/" + req.params.fileName)
})

const home = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(process.env.PORT, async () => {
      console.log(`Server running ${process.env.PORT}`)
    })
  } catch (error) {
    console.error(error)
  }
}

home()
