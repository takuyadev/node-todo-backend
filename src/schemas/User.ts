import { Schema, model, Document } from "mongoose"
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Typescript interface, extended from Document to prevent this = any
interface IUser extends Document {
  username: string
  email: string
  role: string
  password: string
  createdAt: Date
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, "Please add a username"],
  },
  email: {
    type: String,
    required: [true, "Please add a email"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please use a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Before saving, encrypt the password.
UserSchema.pre<IUser>("save", async function (next) {
  // If the password has already been encrypted / has not been modified:
  // Skip encrypting the password

  if (!this.isModified("password")) next()

  // Encrypt password using bcrypt and save it onto schema
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Generate token if called, ex. when logging in, registering
UserSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, `${process.env.JWT_SECRET}`, {
    expiresIn: `${process.env.JWT_EXPIRE}`,
  })
}

// Compare encrypted password and entered password when called
UserSchema.method("matchPassword", async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password)
})

module.exports = model<IUser>("User", UserSchema)
