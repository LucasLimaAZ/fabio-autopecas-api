const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// para outro device na rede local
// app.listen(3000, "0.0.0.0");
