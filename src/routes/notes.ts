import express from "express"

const {
  getNote,
  getNotes,
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/notes")
const router = express.Router({ mergeParams: true })
const { verify, authenticate, authorize } = require("../middlewares/auth")

router.route("/").get(verify, authorize("admin"), getAllNotes)

router
  .route("/:id")
  .get(verify, authenticate, getNotes)
  .post(verify, authenticate, createNote)

router
  .route("/:id/:nid")
  .get(verify, authenticate, getNote)
  .delete(verify, authenticate, deleteNote)
  .put(verify, authenticate, updateNote)

module.exports = router
