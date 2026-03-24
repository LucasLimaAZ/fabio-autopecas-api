const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/CategoryController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, categoryController.create);
router.get("/", authMiddleware, categoryController.findAll);
router.delete("/:id", authMiddleware, categoryController.delete);

module.exports = router;
