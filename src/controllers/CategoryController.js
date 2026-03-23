const { categoryService } = require("../services");

class CategoryController {
  async create(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "name is required",
        });
      }

      const data = { name };

      const category = await categoryService.create(data);

      return res.status(201).json(category);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }

  async findAll(req, res) {
    try {
      const categories = await categoryService.findAll();

      return res.json(categories);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      const category = await categoryService.findById(id);

      return res.json(category);
    } catch (error) {
      return res.status(404).json({
        error: error.message || "Category not found",
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      await categoryService.delete(id);

      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}

module.exports = new CategoryController();
