const { homeService } = require("../services");

class HomeController {
  async getStats(req, res) {
    try {
      const stats = await homeService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({
        error: error.message || "Internal server error",
      });
    }
  }
}

module.exports = new HomeController();
