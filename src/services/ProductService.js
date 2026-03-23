const productRepository = require("../repositories/productRepository");
const categoryRepository = require("../repositories/categoryRepository");

class ProductService {
  async create(data) {
    const { cost_price, sale_price, category_id, ref } = data;

    if (cost_price < 0 || sale_price < 0) {
      throw new Error("Prices cannot be negative");
    }

    const category = await categoryRepository.findById(category_id);

    if (!category) {
      throw new Error("Category not found");
    }

    const existingProduct = await productRepository.findByRef(ref);

    if (existingProduct) {
      throw new Error("Product with this ref already exists");
    }

    return await productRepository.create(data);
  }
}

module.exports = new ProductService();
