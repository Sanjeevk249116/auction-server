const express = require("express");
const { authenticateUser } = require("../middleware/auth.middleware");
const {
  auctionAuthenticate,
  profileLogout,
} = require("../controllers/auth.controller");
const { validAuth } = require("../middleware/auction.middleware");
const {
  userProfile,
  userOrganization,
  craeteOrganization,
  uploadDocumentInOrganization,
  allScrapList,
  selectScrapMaterial,
} = require("../controllers/profile");
const { upload } = require("../middleware/multer.middleware");
const { buyerAuthenticate } = require("../middleware/buyerAuthenticate");
const {
  getAllAuctionAnylitics,
  readBuyerDocuments,
  transactionChart,
} = require("../controllers/buyer/read");
const { uploadFiles, payEmdDeposit } = require("../controllers/buyer/create");
const buyerRouters = express.Router();

// secure routes
buyerRouters.post("/user/authenticate", authenticateUser, auctionAuthenticate);
buyerRouters.put("/user/logout", validAuth, profileLogout);
buyerRouters.get("/user/profile", validAuth, userProfile);
buyerRouters.put("/update/organization", validAuth, craeteOrganization);
buyerRouters.get("/read/organization", validAuth, userOrganization);
buyerRouters.put(
  "/upload/multi-documents",
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
  "/profile/read/analytics",
  buyerAuthenticate,
  getAllAuctionAnylitics
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

module.exports = { buyerRouters };
