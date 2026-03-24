const { productService } = require("../services");

class ProductController {
  async create(req, res) {
    try {
      const {
        name,
        ref,
        notes,
        cost_price,
        sale_price,
        amount,
        minimum_amount,
        category_id,
      } = req.body;

      if (!name || !ref || !category_id) {
        return res.status(400).json({
          error: "name, ref and category_id are required",
        });
      }

      const data = {
        name,
        ref,
        notes,
        cost_price,
        sale_price,
        amount,
        minimum_amount,
        category_id,
      };

      const product = await productService.create(data);

      return res.status(201).json(product);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }

  async findAll(req, res) {
    try {
      const products = await productService.findAll();

      return res.json(products);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      const product = await productService.findById(id);

      return res.json(product);
    } catch (error) {
      return res.status(404).json({
        error: error.message || "Product not found",
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      const {
        name,
        ref,
        notes,
        cost_price,
        sale_price,
        amount,
        minimum_amount,
        category_id,
      } = req.body;

      const data = {
        name,
        ref,
        notes,
        cost_price,
        sale_price,
        amount,
        minimum_amount,
        category_id,
      };

      const product = await productService.update(id, data);

      return res.json(product);
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await productService.delete(id);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
