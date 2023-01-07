import { Request, Response, NextFunction } from "express"
import { IUser } from "../interfaces/IUser"
const jwt = require("jsonwebtoken")
const User = require("../schemas/User")
const asyncHandler = require("../middlewares/async")

interface UserRequest extends Request {
  user: IUser
}

// @desc Verifies user by checking provided token in header

exports.verify = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token

    // Extract token from browser headers, and make Bearer token readable to Express
    // req.headers.authorization === `Bearer ${TOKEN}`: string
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    // If token does not exist in header, extract from cookie
    else if (req.cookies.token) {
      token = req.cookies.token
    }

    // If no token is extracted, then error handle for no token.
    if (!token) {
      res.status(404).json({
        message: "No token, please login.",
        success: false,
        data: {},
      })
    }

    // If token is found, try verifying the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded._id)
      next()
    } catch (err) {
      res.status(401).json({
        message: "Not authorized to access this route.",
        success: false,
        data: {},
      })
    }
  }
)

// @desc Allows user access to their private information

exports.authenticate = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // Check if verified token matches with token
    if (req.params.id === req.user.id) {
      next()
    } else {
      // Provide error if it does not match
      res.status(404).json({
        success: false,
      })
    }
  }
)

// @desc Authorizes and checks role provided in user

exports.authorize = (...roles: string[]) => {
  return (req: UserRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      next(
        res.status(404).json({
          success: false,
          message: `User role ${req.user.role} is not authorized to access this route.`,
        })
      )
    }
    next()
  }
}
