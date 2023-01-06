import { Request, Response, NextFunction } from "express"
const asyncHandler = require("../middlewares/async")
const Note = require("../schemas/Note")

// @desc Get authenticated user notes
// @route /notes
// @access Private, User

exports.getNotes = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const notes = await Note.findById()

    res.status(200).json({
      success: true,
      data: notes,
    })
  }
)
