const mongoose = require("mongoose")

const connectDB = async (URI: string) => {
  const conn = await mongoose.connect(URI)
  console.log(`MongoDB connected: ${conn.connection.host}`)
}

module.exports = connectDB
