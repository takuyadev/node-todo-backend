// Important imports
import { Error } from "mongoose"
const express = require("express")
const path = require("path")
const dotenv = require("dotenv")
const error = require("./middlewares/error")

// Security Packages
const cookieParser = require("cookie-parser")
const mongoSanitize = require("express-mongo-sanitize")
const helmet = require("helmet")
const xss = require("xss-clean")
const rateLimit = require("express-rate-limit")
const hpp = require("hpp")
const cors = require("cors")

// Import users into the main server
const users = require("./routes/users.ts")
const notes = require("./routes/notes.ts")
const auth = require("./routes/auth.ts")
const connect = require("./config/db")

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, "./.env/.env.local") })

// Connect to MongoDB
connect(process.env.MONGODB_URI)

// Initialize server variable
const app = express()

// Parse Body for req.body
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
})
app.use(limiter)

// Prevent http param pollution
app.use(hpp())

// Enable CORS
app.use(cors())

// Give routes endpoints
app.use("/users", users)
app.use("/notes", notes)
app.use("/auth", auth)

// Error Handler
app.use(error)

// Default message when server starts
app.listen(process.env.PORT, () => {
  console.log(`Note app is listening at port ${process.env.PORT}!`)
})

// Prevent crashing on unhandled errors and rejected promises
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`)
})
