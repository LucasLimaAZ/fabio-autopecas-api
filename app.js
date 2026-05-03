const express = require("express");
const routes = require("./src/routes");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(routes);

module.exports = app;
