const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

class AuthService {
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Senha inválida");
    }

    const token = jwt.sign({ user: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return { token };
  }
}

module.exports = new AuthService();
