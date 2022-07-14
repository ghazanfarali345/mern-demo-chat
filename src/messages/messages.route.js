const express = require("express");
const { allMessages, sendMessage } = require("./messages.controller");
const { protect } = require("../middlewares/authChek");

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

module.exports = router;
