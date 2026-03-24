const express = require("express");
const router = express.Router();

const productController = require("../controllers/ProductController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, productController.create);
router.get("/", authMiddleware, productController.findAll);
router.patch("/:id", authMiddleware, productController.update);
router.delete("/:id", authMiddleware, productController.delete);

module.exports = router;
