// Imports
import { Response, Request, NextFunction } from "express"

const User = require("../schemas/User")
const asyncHandler = require("../middlewares/async")

// @desc Get all users
// @route /:id
// @access Public

exports.getUsers = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await User.find()

    res.status(200).json({
      success: true,
      data: users,
    })
  }
)

// @desc Get single user by id
// @route /:id
// @access Public

exports.getUserById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await User.findById(req.params.id)

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)

// @desc Create user
// @route /:id
// @access Private: Admin

exports.createUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await User.create(req.body)

    res.status(201).json({
      success: true,
      data: user,
    })
  }
)

// @desc Delete user
// @route /:id
// @access Private: Admin

exports.deleteUser = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await User.deleteOne({ _id: req.params.id })

    res.status(200).json({
      success: true,
      data: user,
    })
  }
)
