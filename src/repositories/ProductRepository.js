const { Product } = require("../database/models");

class ProductRepository {
  async create(data) {
    return await Product.create(data);
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

  async findAll({ page = 1, limit = 10 } = {}) {
    const result = await Product.findAndCountAll({
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
      where: { category_id: categoryId },
    });
  }

  async update(id, data) {
    await Product.update(data, {
      where: { id },
    });

    return await this.findById(id);
  }

  async delete(id) {
    return await Product.destroy({
      where: { id },
    });
  }
}

module.exports = new ProductRepository();
