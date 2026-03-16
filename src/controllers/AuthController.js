const { authService } = require("../services");

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return res.json(result);
    } catch (err) {
      return res.status(401).json({
        error: err.message,
      });
    }
  }
}

module.exports = new AuthController();
