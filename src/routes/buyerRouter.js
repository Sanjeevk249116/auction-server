const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const { auctionAuthenticate } = require("../controllers/auth.controller");
const { validAuth } = require("../middleware/auction.middleware");
const {
  userProfile,
  userOrganization,
  craeteOrganization,
  uploadDocumentInOrganization,
  allScrapList,
  selectScrapMaterial,
  enterGstNumber,
  updateOrganization,
} = require("../controllers/profile");
const { upload } = require("../middleware/multer.middleware");
const { buyerAuthenticate } = require("../middleware/buyerAuthenticate");
const {
  readBuyerDocuments,
  transactionChart,
  readInspectionRequest,
  getAllAuctionAnyliticsForBuyer,
  getAuctionsWithPcbRequired,
} = require("../controllers/buyer/read");
const {
  uploadFiles,
  payEmdDeposit,
  inspectionRequest,
  sendResponseOfInspection,
} = require("../controllers/buyer/create");
const buyerRouters = express.Router();

// secure routes
buyerRouters.post("/authenticate", authenticateUser, auctionAuthenticate);
buyerRouters.post(
  "/authenticate/verify-gstin/:GSTIN",
  validAuth,
  enterGstNumber
);
buyerRouters.get("/profile/read", validAuth, userProfile);
buyerRouters.put(
  "/profile/update/organization-name",
  validAuth,
  craeteOrganization
);
buyerRouters.get("/profile/read/organization", validAuth, userOrganization);
buyerRouters.put(
  "/profile/update/organization-details",
  validAuth,
  updateOrganization
);

buyerRouters.put(
  "/profile/update/multi-documents",
  validAuth,
  upload.fields([
    {
      name: "PCB",
      maxCount: 1,
    },
    {
      name: "GST",
      maxCount: 1,
    },
    {
      name: "Goods-And-Services-Tax",
      maxCount: 1,
    },
    {
      name: "PAN-Card",
      maxCount: 1,
    },
    {
      name: "KYC",
      maxCount: 1,
    },
  ]),
  uploadDocumentInOrganization
);
buyerRouters.get("/material-classification/read", validAuth, allScrapList);
buyerRouters.put(
  "/organization/update/add-classification",
  validAuth,
  selectScrapMaterial
);

buyerRouters.get(
  "/profile/read/all-documnets",
  buyerAuthenticate,
  readBuyerDocuments
);
buyerRouters.put(
  "/profile/update/document",
  buyerAuthenticate,
  upload.single("document"),
  uploadFiles
);
buyerRouters.get(
  "/profile/read/transactions-analytics",
  buyerAuthenticate,
  transactionChart
);
buyerRouters.put(
  "/auction/update/pay-deposit/:id",
  buyerAuthenticate,
  payEmdDeposit
);
buyerRouters.post(
  "/auction/create/inspection-request/:id",
  buyerAuthenticate,
  inspectionRequest
);

buyerRouters.get(
  "/profile/read/inspections-requested",
  buyerAuthenticate,
  readInspectionRequest
);
buyerRouters.get(
  "/auction/read/pcb-offers",
  buyerAuthenticate,
  getAuctionsWithPcbRequired
);

buyerRouters.post(
  "/auction/create/inspection-response/:id",
  buyerAuthenticate,
  sendResponseOfInspection
);

buyerRouters.get(
  "/profile/read/buyer/analytics",
  buyerAuthenticate,
  getAllAuctionAnyliticsForBuyer
);
module.exports = { buyerRouters };
