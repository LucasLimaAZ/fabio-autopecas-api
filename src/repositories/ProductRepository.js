const { Product, sequelize } = require("../database/models");

class ProductRepository {
  async create(data) {
    return await Product.create(data);
  }

  async findLowStock() {
    return await Product.findAll({
      where: {
        status: "active",
        [sequelize.Sequelize.Op.and]: sequelize.literal(
          "amount < minimum_amount",
        ),
      },
      order: [
        ["amount", "ASC"],
        ["minimum_amount", "ASC"],
      ],
    });
  }

  async findById(id) {
    return await Product.findOne({
      where: { id },
    });
  }

  async findByRef(ref) {
    return await Product.findOne({
      where: { ref },
    });
  }

  async findBySearchTerm(searchTerm) {
    const { Op } = Product.sequelize.Sequelize;
    const term = `%${searchTerm}%`;

    return await Product.findAll({
      where: {
        status: "active",
        [Op.or]: [{ name: { [Op.like]: term } }, { ref: { [Op.like]: term } }],
      },
      order: [["id", "ASC"]],
    });
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    const result = await Product.findAndCountAll({
      where: { status: "active" },
      limit,
      offset: (page - 1) * limit,
      order: [["id", "ASC"]],
    });

    return {
      products: result.rows,
      pagination: {
        page,
        limit,
        total: result.count,
        totalPages: Math.ceil(result.count / limit),
      },
    };
  }

  async findByCategoryId(categoryId) {
    return await Product.findAll({
      where: { category_id: categoryId, status: "active" },
    });
  }

  async update(id, data) {
    await Product.update(data, {
      where: { id },
    });

    return await this.findById(id);
  }

  async archive(id) {
    await Product.update({ status: "archived" }, { where: { id } });

    return await this.findById(id);
  }
}

module.exports = new ProductRepository();
