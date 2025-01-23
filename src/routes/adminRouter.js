const express = require("express");
const {
  readAllSeller,
  readSingleAccount,
  readClassificationMaterial,
  readAllBuyer,
  readCoordinator,
  readAllDocuments,
} = require("../controllers/admin/read");
const { adminAuthenticate } = require("../middleware/adminAuthenticate");
const {
  createCoordinator,
  updateCoordinator,
  verifyDocument,
  rejectDocument,
} = require("../controllers/admin/update");
const { deleteCoordinator } = require("../controllers/admin/delete");
const {
  createAuction,
  createOffer,
  addMaterialClassification,
} = require("../controllers/admin/create");
const { readSingleAuction } = require("../controllers/admin/read");
const { handleDynamicFields } = require("../helper");
const { upload } = require("../middleware/multer.middleware");
const {
  readAllAuction,
  readTodayAuction,
  readUpcommingAuction,
  readCompletedAuction,
  singleSellerAuctionList,
} = require("../controllers/adminAuction/read");

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
adminRouter.get(
  "/read/single-auction/:id",
  adminAuthenticate,
  readSingleAuction
);
adminRouter.post(
  "/create/offer/auction/:id",
  adminAuthenticate,
  upload.fields([
    {
      name: "photo1",
      maxCount: 1,
    },
    {
      name: "photo2",
      maxCount: 1,
    },
    {
      name: "photo3",
      maxCount: 1,
    },
    {
      name: "photo4",
      maxCount: 1,
    },
    {
      name: "photo5",
      maxCount: 1,
    },
    {
      name: "photo6",
      maxCount: 1,
    },
  ]),
  createOffer
);
adminRouter.get(
  "/read/material-classification",
  adminAuthenticate,
  readClassificationMaterial
);
adminRouter.post(
  "/material-classification/create",
  adminAuthenticate,
  addMaterialClassification
);
adminRouter.get(
  "/auction/read/admin/all-events",
  adminAuthenticate,
  readAllAuction
);
adminRouter.get(
  "/auction/read/admin/today-auctions",
  adminAuthenticate,
  readTodayAuction
);
adminRouter.get(
  "/auction/read/upcoming-auctions",
  adminAuthenticate,
  readUpcommingAuction
);
adminRouter.get(
  "/auction/read/admin/completed-auctions",
  adminAuthenticate,
  readCompletedAuction
);
adminRouter.get(
  "/auction/read/admin/single-seller-auctions/:id",
  adminAuthenticate,
  singleSellerAuctionList
);
adminRouter.get(
  "/documents/read/admin/all-documents/:id",
  adminAuthenticate,
  readAllDocuments
);

adminRouter.put(
  "/documents/update/verify-document/:id",
  adminAuthenticate,
  verifyDocument
);
adminRouter.put(
  "/documents/update/rejecte-document/:id",
  adminAuthenticate,
  rejectDocument
);

module.exports = { adminRouter };
