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
}

module.exports = new ProductController();
