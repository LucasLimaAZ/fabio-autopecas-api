const { Product, Sale, User, sequelize } = require("../database/models");

class HomeService {
  async getDashboardStats() {
    const [totalProducts, totalSales, totalUsers, lowStockProducts] =
      await Promise.all([
        Product.count(),
        Sale.count(),
        User.count(),
        Product.count({
          where: sequelize.literal("amount < minimum_amount"),
        }),
      ]);

    return {
      totalProducts,
      totalSales,
      totalUsers,
      lowStockProducts,
    };
  }
}

module.exports = new HomeService();
