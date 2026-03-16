const express = require("express");
const router = express.Router();

const userController = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", userController.create);
router.get("/info", authMiddleware, () => "User protected info!");

module.exports = router;
