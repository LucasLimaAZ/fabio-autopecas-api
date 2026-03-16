const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");

class UserService {
  async create({ name, email, password }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      password: passwordHash,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

module.exports = new UserService();
