const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");

router.get("/", (req, res) =>
  res.status(200).json("fabio-autopecas is running!"),
);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);

module.exports = router;
