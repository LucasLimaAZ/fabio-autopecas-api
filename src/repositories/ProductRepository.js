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

  async findAll() {
    return await Product.findAll();
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
