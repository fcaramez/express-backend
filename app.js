require("dotenv/config");
require("./db");
const express = require("express");
const app = express();
require("./config")(app);

const routes = require("./routes/index.routes");

app.use("/", routes);

require("./error-handling")(app);

module.exports = app;
