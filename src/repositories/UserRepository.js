const { User } = require("../database/models");

class UserRepository {
  async create(data) {
    return User.create(data);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }
}

module.exports = new UserRepository();
