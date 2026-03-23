const categoryRepository = require("../repositories/categoryRepository");
const productRepository = require("../repositories/productRepository");

class CategoryService {
  async create(data) {
    const { name } = data;

    if (!name) {
      throw new Error("Category name is required");
    }

    const normalizedName = name.trim();

    const existingCategory =
      await categoryRepository.findByName(normalizedName);

    if (existingCategory) {
      throw new Error("Category already exists");
    }

    return await categoryRepository.create({
      name: normalizedName,
    });
  }

  async findAll() {
    return await categoryRepository.findAll();
  }

  async findById(id) {
    if (!id) {
      throw new Error("Category id is required");
    }

    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    return category;
  }

  async delete(id) {
    if (!id) {
      throw new Error("Category id is required");
    }

    const category = await categoryRepository.findById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    const products = await productRepository.findByCategoryId(id);

    if (products.length > 0) {
      throw new Error("Cannot delete category with products");
    }

    await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
