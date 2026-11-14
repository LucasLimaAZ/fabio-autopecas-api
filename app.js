const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const routes = require("./src/routes");
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(routes);

module.exports = app;
