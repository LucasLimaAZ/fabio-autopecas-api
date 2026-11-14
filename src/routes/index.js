const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const saleRoutes = require("./saleRoutes");
const homeController = require("../controllers/HomeController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", (req, res) =>
  res.status(200).json("fabio-autopecas is running!"),
);

/**
 * @openapi
 * /home:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna estatísticas gerais da home page
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas da home page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomeStats'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/home", authMiddleware, homeController.getStats);
router.use("/user", userRoutes);
router.use("/auth", authRoutes);
router.use("/product", productRoutes);
router.use("/category", categoryRoutes);
router.use("/sale", saleRoutes);

module.exports = router;
