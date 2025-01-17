const mongoose = require("mongoose");
require("dotenv").config();

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGOSHURL);
  } catch (error) {
    console.log("error in connection", error);
  }
};

module.exports = { connection };
