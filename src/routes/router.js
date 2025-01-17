const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const { auctionAuthenticate } = require("../controllers/auth.controller");
const routers = express.Router();

routers.post("/user/authenticate", authenticateUser, auctionAuthenticate);


module.exports = { routers };
