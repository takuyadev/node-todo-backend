import express from "express"

const { getNotes } = require("../controllers/notes.ts")
const router = express.Router({ mergeParams: true })

router.route("/").get(getNotes)

module.exports = router
