const express = require("express");
const { readAllSeller } = require("../controllers/admin/read");
const { adminAuthenticate } = require("../middleware/adminAuthenticate");
const adminRouter = express.Router();

adminRouter.get("/read/seller-list", adminAuthenticate, readAllSeller);

module.exports = { adminRouter };
