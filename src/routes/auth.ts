import express from "express"

const { register, login } = require("../controllers/auth.ts")
const router = express.Router({ mergeParams: true })

router.route("/register").post(register)
router.route("/login").post(login)

module.exports = router
