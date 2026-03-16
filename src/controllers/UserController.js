const { userService } = require("../services");

class UserController {
  async create(req, res) {
    const { name, email, password } = req.body;

    const user = await userService.create({
      name,
      email,
      password,
    });

    return res.status(201).json(user);
  }
}

module.exports = new UserController();
