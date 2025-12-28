const router = require("express").Router();
const { getUsers } = require("../../controllers/messages/user.controller");

router.get("/", getUsers);

module.exports = router;
