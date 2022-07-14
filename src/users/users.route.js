const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../users/users.controller");
const { protect } = require("../middlewares/authChek");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(registerUser);
router.post("/login", authUser);

module.exports = router;
