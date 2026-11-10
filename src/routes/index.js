const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const saleRoutes = require("./saleRoutes");

router.get("/", (req, res) =>
  res.status(200).json("fabio-autopecas is running!"),
);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/sale", saleRoutes);

module.exports = router;
