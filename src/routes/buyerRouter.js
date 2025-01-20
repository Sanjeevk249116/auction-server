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
  addMaterialClassification,
  allScrapList,
  selectScrapMaterial,
} = require("../controllers/profile");
const { upload } = require("../middleware/multer.middleware");
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
buyerRouters.post(
  "/material-classification/create",
  validAuth,
  addMaterialClassification
);
buyerRouters.get("/material-classification/read", validAuth, allScrapList);
buyerRouters.put(
  "/organization/update/add-classification",
  validAuth,
  selectScrapMaterial
);

module.exports = { buyerRouters };
