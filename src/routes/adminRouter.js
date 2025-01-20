const express = require("express");
const {
  readAllSeller,
  readSingleAccount,
  readAllBuyer,
  readCoordinator,
} = require("../controllers/admin/read");
const { adminAuthenticate } = require("../middleware/adminAuthenticate");
const {
  createCoordinator,
  updateCoordinator,
} = require("../controllers/admin/update");
const { deleteCoordinator } = require("../controllers/admin/delete");
const { createAuction } = require("../controllers/admin/create");

const adminRouter = express.Router();

adminRouter.get("/read/seller-list", adminAuthenticate, readAllSeller);
adminRouter.get("/read/buyer-list", adminAuthenticate, readAllBuyer);
adminRouter.get(
  "/read/single-account/:id",
  adminAuthenticate,
  readSingleAccount
);
adminRouter.get("/read/coordinator", adminAuthenticate, readCoordinator);
adminRouter.post("/create/coordinator", adminAuthenticate, createCoordinator);
adminRouter.put(
  "/update/coordinator/:id",
  adminAuthenticate,
  updateCoordinator
);
adminRouter.delete(
  "/delete/coordinator/:id",
  adminAuthenticate,
  deleteCoordinator
);

adminRouter.post("/create/auction/:id", adminAuthenticate, createAuction);

module.exports = { adminRouter };
