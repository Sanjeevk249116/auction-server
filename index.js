const express = require("express");
const { app } = require("./src/app");
require("dotenv").config();
const { connection } = require("./src/config/connection");

app.listen(process.env.PORT, async (req, res) => {
  try {
    await connection();
    console.log(`Server is running on port ${process.env.PORT || 8082}`);
  } catch (error) {
    console.log("failed to connect server");
  }
});
