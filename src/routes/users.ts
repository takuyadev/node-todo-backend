import express from "express"

const {
  getUsers,
  getUserById,
  createUser,
  deleteUser,
} = require("../controllers/users.ts")

const router = express.Router({ mergeParams: true })

router.route("/").get(getUsers).post(createUser)
router.route("/:id").get(getUserById).delete(deleteUser)

module.exports = router
