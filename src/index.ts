// Important imports
const express = require("express")
const path = require("path")
const dotenv = require("dotenv")
const error = require("./middlewares/error")

// Import users into the main server
const users = require("./routes/users.ts")
const notes = require("./routes/notes.ts")
const auth = require("./routes/auth.ts")
const connect = require("./config/db")

// Load Environment Variables
dotenv.config({ path: path.resolve(__dirname, "./.env/.env.local") })

// Initialize server variable
const app = express()

// Connect to MongoDB
connect(process.env.MONGODB_URI)

// Parse Body for req.body
app.use(express.json())

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
