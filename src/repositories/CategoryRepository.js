const { Category } = require("../database/models");

class CategoryRepository {
  async create(data) {
    return await Category.create(data);
  }

  async findAll() {
    return await Category.findAll();
  }

  async findById(id) {
    const cat = await Category.findOne({
      where: { id },
    });

    return cat;
  }

  async findByName(name) {
    return await Category.findOne({
      where: { name },
    });
  }

  async delete(id) {
    return await Category.destroy({
      where: { id },
    });
  }
}

module.exports = new CategoryRepository();
