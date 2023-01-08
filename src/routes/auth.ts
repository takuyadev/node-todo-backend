import express from "express"

const {
  register,
  login,
  logout,
  resendConfirmEmail,
  confirmEmail,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.ts")
const { verify, authenticate } = require("../middlewares/auth")
const router = express.Router({ mergeParams: true })

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(logout)
router.route("/confirmemail").post(resendConfirmEmail)
router.route("/confirmemail/:id").post(confirmEmail)
router.route("/forgotpassword").post(forgotPassword)
router.route("/resetpassword/:id").post(resetPassword)
router.route("/updatedetails/:id").put(verify, authenticate, updateDetails)
router.route("/updatepassword/:id").put(verify, authenticate, updatePassword)

module.exports = router
