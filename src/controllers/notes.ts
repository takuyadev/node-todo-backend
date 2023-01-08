import { Request, Response, NextFunction } from "express"
import { IUserWithId } from "../interfaces/IUser"
const asyncHandler = require("../middlewares/async")
const Note = require("../schemas/Note")

interface UserRequest extends Request {
  user: IUserWithId
}

// @desc Get all personal notes
// @route /notes/:id
// @access Private, User

exports.getNotes = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const notes = await Note.find({ user: req.params.id })
    res.status(200).json({
      success: true,
      _id: req.params.id,
      data: notes,
    })
  }
)

// @desc Get all personal notes
// @route /notes/:id/:nid
// @access Private, User

exports.getNote = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const notes = await Note.find({ _id: req.params.nid })
    res.status(200).json({
      success: true,
      _id: req.params.id,
      data: notes,
    })
  }
)

// @desc Get all user notes
// @route /notes
// @access Private, User

exports.getAllNotes = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const notes = await Note.find()
    res.status(200).json({
      success: true,
      _id: req.params.id,
      data: notes,
    })
  }
)

// @desc Create single personal note
// @route /notes/:id
// @access Private, User

exports.createNote = asyncHandler(
  async (req: UserRequest, res: Response, _next: NextFunction) => {
    const note = await Note.create({ user: req.user.id, note: req.body.note })
    res.status(200).json({
      success: true,
      data: note,
    })
  }
)

// @desc Delete single personal note
// @route /notes/:id/:nid
// @access Private, User

exports.deleteNote = asyncHandler(
  async (req: UserRequest, res: Response, _next: NextFunction) => {
    const note = await Note.findOneAndDelete({ _id: req.params.nid })
    res.status(200).json({
      success: true,
      data: note,
    })
  }
)

// @desc Update single personal note
// @route /notes/:id/:nid
// @access Private, User

exports.updateNote = asyncHandler(
  async (req: UserRequest, res: Response, _next: NextFunction) => {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.nid },
      { note: req.body.note }
    )
    res.status(200).json({
      success: true,
      data: note,
    })
  }
)
