const saleService = require("../services/SaleService");

class SaleController {
  async create(req, res) {
    try {
      const sale = await saleService.create(req.body, req.userId);
      return res.status(201).json(sale);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
      }

      if (error.name === "InsufficientStockError") {
        return res.status(409).json({ error: error.message });
      }
      if (error.name === "AuthenticatedUserError") {
        return res.status(401).json({ error: error.message });
      }

      return res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }

  async findAll(req, res) {
    try {
      return res.json(
        await saleService.findAll({
          page: req.query.page,
          limit: req.query.limit,
        }),
      );
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async getProductsSoldByDateRange(req, res) {
    try {
      return res.json(
        await saleService.getProductsSoldByDateRange({
          startDate: req.query.startDate,
          endDate: req.query.endDate,
        }),
      );
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async getTopProductsByPeriod(req, res) {
    try {
      return res.json(
        await saleService.getTopProductsByPeriod({
          period: req.query.period,
          year: req.query.year,
          month: req.query.month,
          week: req.query.week,
          limit: req.query.limit,
          startDate: req.query.startDate,
          endDate: req.query.endDate,
        }),
      );
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async getTotalRevenueByDateRange(req, res) {
    try {
      return res.json(
        await saleService.getTotalRevenueByDateRange({
          startDate: req.query.startDate,
          endDate: req.query.endDate,
        }),
      );
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async findById(req, res) {
    try {
      return res.json(await saleService.findById(req.params.id));
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async update(req, res) {
    try {
      return res.json(await saleService.update(req.params.id, req.body));
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  async delete(req, res) {
    try {
      await saleService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) {
      return this.handleError(error, res);
    }
  }

  handleError(error, res) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === "NotFoundError") {
      return res.status(404).json({ error: error.message });
    }
    if (error.name === "InsufficientStockError") {
      return res.status(409).json({ error: error.message });
    }
    if (error.name === "AuthenticatedUserError") {
      return res.status(401).json({ error: error.message });
    }
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
}

module.exports = new SaleController();
