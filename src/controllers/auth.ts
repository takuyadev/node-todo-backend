import { Request, Response, NextFunction } from "express"
const User = require("../schemas/User")
const asyncHandler = require("../middlewares/async")

// @desc Registers user, and sends token to cookie for authentication
// @route /auth/register
// @access Public: All roles

exports.register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, email, password } = req.body

    // Error handle if form not filled
    if (!username || !email || !password) {
      res.status(404).json({
        message: "Please provide username, email, and password",
        success: false,
        data: {},
      })
    }

    // Create User based on information provided
    const user = await User.create({
      username,
      email,
      password,
    })

    // If User.create doesn't fail, generate token to user
    const token = user.generateToken()

    // Send success response
    res.status(200).json({
      success: true,
      token,
    })
  }
)

//

exports.login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body

    // Error handle if form not filled
    if (!email || !password) {
      res.status(404).json({
        success: false,
        message: "Please provide email and password",
        data: {},
      })
    }

    // Find user, and also select encrypted password in database
    const user = await User.findOne({ email }).select("+password")

    // If user doesn't exist, then error handle
    if (!user) {
      res.status(404).json({
        success: false,
        message: "Invalid credentials",
        data: {},
      })
    }

    // Match the entered password against the encrypted password, decrypt, and see if it matches.
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      res.status(404).json({
        success: false,
        message: "Incorrect password.",
        data: {},
      })
      next()
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)
