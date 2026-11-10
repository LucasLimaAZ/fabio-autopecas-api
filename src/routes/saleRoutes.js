const express = require("express");
const router = express.Router();

const saleController = require("../controllers/SaleController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, saleController.create);
router.get("/", authMiddleware, saleController.findAll);
router.get("/:id", authMiddleware, saleController.findById);
router.patch("/:id", authMiddleware, saleController.update);
router.delete("/:id", authMiddleware, saleController.delete);

module.exports = router;
