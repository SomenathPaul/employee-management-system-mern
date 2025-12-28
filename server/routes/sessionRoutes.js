const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const {
  startSession,
  endSession,
} = require("../controllers/sessionController");

router.post("/start", auth, startSession);
router.post("/end", auth, endSession);

module.exports = router;
