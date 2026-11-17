const { Product, Sale, SaleItem, sequelize } = require("../database/models");
const { Op } = require("sequelize");

class HomeService {
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async getDashboardStats() {
    const today = new Date();
    const todayDate = this.formatDate(today);

    const monthStart = new Date(today);
    monthStart.setDate(monthStart.getDate() - 29);
    const monthStartDate = this.formatDate(monthStart);

    const [totalSalesToday, lowStockProducts, monthlySales] = await Promise.all(
      [
        Sale.count({
          where: { sale_date: todayDate },
        }),
        Product.findAll({
          where: {
            status: "active",
            [sequelize.Sequelize.Op.and]: sequelize.literal(
              "amount < minimum_amount",
            ),
          },
          attributes: [
            "id",
            "name",
            "ref",
            "amount",
            "minimum_amount",
            "category_id",
            "sale_price",
          ],
          order: [
            ["amount", "ASC"],
            ["minimum_amount", "DESC"],
            ["name", "ASC"],
          ],
          limit: 5,
        }),
        Sale.findAll({
          where: {
            sale_date: {
              [Op.between]: [monthStartDate, todayDate],
            },
          },
          attributes: ["id", "sale_date"],
          include: [
            {
              model: SaleItem,
              as: "items",
              attributes: ["quantity", "subtotal"],
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: [
                    "id",
                    "name",
                    "ref",
                    "category_id",
                    "amount",
                    "sale_price",
                  ],
                },
              ],
            },
          ],
        }),
      ],
    );

    const productSales = new Map();

    for (const sale of monthlySales) {
      for (const item of sale.items || []) {
        if (!item?.product) continue;

        const productId = Number(item.product.id);
        const quantity = Number(item.quantity || 0);
        const subtotal = Number(item.subtotal || 0);
        const current = productSales.get(productId);

        if (current) {
          current.total_quantity += quantity;
          current.total_amount += subtotal;
        } else {
          productSales.set(productId, {
            product_id: productId,
            name: item.product.name,
            ref: item.product.ref,
            category_id: item.product.category_id,
            amount: item.product.amount,
            sale_price: item.product.sale_price,
            total_quantity: quantity,
            total_amount: subtotal,
          });
        }
      }
    }

    const topSellingProducts = [...productSales.values()]
      .map((product) => ({
        ...product,
        sale_price:
          product.sale_price !== null
            ? Number(product.sale_price).toFixed(2)
            : null,
        total_amount: Number(product.total_amount).toFixed(2),
      }))
      .sort(
        (first, second) =>
          second.total_quantity - first.total_quantity ||
          Number(second.total_amount) - Number(first.total_amount),
      )
      .slice(0, 5)
      .map((product, index) => ({ rank: index + 1, ...product }));

    return {
      totalSalesToday,
      lowStockProducts: lowStockProducts.map((product) => {
        const amount = Number(product.amount);
        const minimumAmount = Number(product.minimum_amount);

        return {
          id: product.id,
          name: product.name,
          ref: product.ref,
          category_id: product.category_id,
          amount,
          minimum_amount: minimumAmount,
          missing_amount: Math.max(minimumAmount - amount, 0),
          sale_price:
            product.sale_price !== null
              ? Number(product.sale_price).toFixed(2)
              : null,
        };
      }),
      topSellingProducts,
      topSellingPeriod: {
        startDate: monthStartDate,
        endDate: todayDate,
      },
    };
  }
}

module.exports = new HomeService();
