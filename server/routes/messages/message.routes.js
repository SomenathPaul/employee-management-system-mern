const router = require("express").Router();
const {
  getMessages,
  markAsRead,
} = require("../../controllers/messages/message.controller");

router.get("/:u1/:u2", getMessages);
router.post("/read", markAsRead);

module.exports = router;
