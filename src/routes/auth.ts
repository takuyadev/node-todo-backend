import express from "express"

const {
  register,
  login,
  logout,
  updateDetails,
  updatePassword,
} = require("../controllers/auth.ts")
const { verify, authenticate } = require("../middlewares/auth")
const router = express.Router({ mergeParams: true })

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/updatedetails/:id").put(verify, authenticate, updateDetails)
router.route("/updatepassword/:id").put(verify, authenticate, updatePassword)

module.exports = router
