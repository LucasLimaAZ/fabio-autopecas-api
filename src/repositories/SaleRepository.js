const { Sale, SaleItem, Product, User } = require("../database/models");

class SaleRepository {
  async create(data, options) {
    return await Sale.create(data, options);
  }

  async createItems(items, options) {
    return await SaleItem.bulkCreate(items, options);
  }

  async findById(id, options = {}) {
    return await Sale.findByPk(id, {
      ...options,
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    const result = await Sale.findAndCountAll({
      distinct: true,
      limit,
      offset: (page - 1) * limit,
      order: [["id", "DESC"]],
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: SaleItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    return {
      sales: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
      },
    };
  }

  async deleteItems(saleId, options) {
    return await SaleItem.destroy({ where: { sale_id: saleId }, ...options });
  }

  async delete(sale, options) {
    return await sale.destroy(options);
  }
}

module.exports = new SaleRepository();
