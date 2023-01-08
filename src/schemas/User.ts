import { Schema, model, Document } from "mongoose"
import { IUser } from "../interfaces/IUser"
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

// Typescript interface, extended from Document to prevent this = any
interface IUserSchema extends IUser, Document {}

const UserSchema = new Schema<IUserSchema>({
  username: {
    type: String,
    required: [true, "Please add a username"],
    min: [6, "Please try a longer username"],
    max: [24, "Please try a shorter username"],
  },
  email: {
    type: String,
    required: [true, "Please add a email"],
    max: [320, "Please try a shorter email address"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please use a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    min: [8, "Please try a longer password"],
    max: [64, "Please try a shorter password"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
  },
  isEmailConfirmedToken: {
    type: String,
    default: null,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpire: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Before saving, encrypt the password.
UserSchema.pre<IUserSchema>("save", async function (next) {
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
    expiresIn: Number(process.env.JWT_EXPIRE) * 24 * 60 * 60,
  })
}

// Compare encrypted password and entered password when called
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password)
}

// Generate reset password token, and set schema to reflect token expiration and authenticity
UserSchema.methods.getPasswordToken = async function () {
  // Generate unhashed reset token
  const unhashedResetToken = crypto.randomBytes(20).toString("hex")

  // Hash token and set new token to User schema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(unhashedResetToken)
    .digest("hex")

  // Set expire and set new time to User schema
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000

  // Return token for usage
  return unhashedResetToken
}

// Generate confirm email token, and set user schema to reflect isEmailConfirmed property
UserSchema.methods.getEmailToken = async function () {
  // Generate unhashed confirm token
  const unhashedConfirmToken = crypto.randomBytes(20).toString("hex")

  // Hash token and set token to User schema
  this.isEmailConfirmedToken = crypto
    .createHash("sha256")
    .update(unhashedConfirmToken)
    .digest("hex")

  // Return token for usage
  return unhashedConfirmToken
}

module.exports = model<IUser>("User", UserSchema)
