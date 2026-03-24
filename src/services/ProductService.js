const productRepository = require("../repositories/productRepository");
const categoryRepository = require("../repositories/categoryRepository");

class ProductService {
  async create(data) {
    const { cost_price, sale_price, category_id, ref } = data;

    if (cost_price < 0 || sale_price < 0) {
      throw new Error("Prices cannot be negative");
    }

    if (cost_price !== null && sale_price !== null && sale_price < cost_price) {
      throw new Error("Sale price cannot be lower than cost price");
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

  async findAll() {
    return await productRepository.findAll();
  }

  async findById(id) {
    if (!id) {
      throw new Error("Product id is required");
    }

    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  async update(id, data) {
    if (!id) {
      throw new Error("Product id is required");
    }

    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    const { cost_price, sale_price, category_id, ref } = data;

    if (cost_price !== undefined && cost_price < 0) {
      throw new Error("Cost price cannot be negative");
    }

    if (sale_price !== undefined && sale_price < 0) {
      throw new Error("Sale price cannot be negative");
    }

    if (
      cost_price !== undefined &&
      sale_price !== undefined &&
      sale_price < cost_price
    ) {
      throw new Error("Sale price cannot be lower than cost price");
    }

    if (category_id !== undefined) {
      const category = await categoryRepository.findById(category_id);

      if (!category) {
        throw new Error("Category not found");
      }
    }

    if (ref !== undefined) {
      const existingProduct = await productRepository.findByRef(ref);

      if (existingProduct && existingProduct.id !== Number(id)) {
        throw new Error("Product with this ref already exists");
      }
    }

    return await productRepository.update(id, data);
  }

  async delete(id) {
    if (!id) {
      throw new Error("Product id is required");
    }

    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    await productRepository.delete(id);
  }
}

module.exports = new ProductService();
