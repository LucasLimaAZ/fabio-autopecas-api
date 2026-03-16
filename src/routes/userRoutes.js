const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", userController.create);
router.get("/info", authMiddleware, (req, res) =>
  res.status(200).json("User protected info!"),
);

module.exports = router;
