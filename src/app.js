const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { routers } = require("./routes/router");
const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cors({
    origin: "*",
  })
);

app.use("/", routers);
app.use((req, res) => res.status(404).send("The requested url is not found."));

module.exports = { app };
