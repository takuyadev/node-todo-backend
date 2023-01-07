import { Request, Response, NextFunction } from "express"
import { IUser } from "../interfaces/IUser"
const User = require("../schemas/User")
const asyncHandler = require("../middlewares/async")

// Middleware for authentication; get token from model, save to cookie, and send response to server

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  // Generate token using User's Schema method
  const token = user.generateToken()

  // Sets expiration date for the token
  const options = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  })
}

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
    sendTokenResponse(user, 200, res)
  }
)

// @desc Login user, and send token for authentication
// @route /auth/login
// @access Public: All roles

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

    // If match returns false, then error handle that password returned incorrect
    if (!isMatch) {
      res.status(404).json({
        success: false,
        message: "Incorrect password.",
        data: {},
      })
      next()
    }

    // If all checks pass, then allow user to login and generate token
    sendTokenResponse(user, 200, res)
  }
)

// @desc Logout user from session, clears token from cookie and header
// @routes /auth/logout
// @access Private: Authenticated Users

exports.logout = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    })

    res.status(200).json({
      success: true,
      token: {},
    })
  }
)

// @desc Update user information: email and username
// @routes /auth/updatedetails
// @access Private: User

exports.updateDetails = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { username, email } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

// @desc Update user password
// @routes /auth/updatepassword
// @access Private: User

exports.updatePassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.params.id).select("+password")
    if (!(await user.matchPassword(currentPassword))) {
      res.status(404).json({
        message: "Password incorrect, please enter your previous password",
        success: false,
      })
    }

    res.status(200).json({
      message: `Password reset to: ${newPassword}`,
      success: true,
    })
  }
)
