const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");

router.get("/", (req, res) =>
  res.status(200).json("fabio-autopecas is running!"),
);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);

module.exports = router;
