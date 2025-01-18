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
const routers = express.Router();

// secure routes
routers.post("/user/authenticate", authenticateUser, auctionAuthenticate);
routers.put("/user/logout", validAuth, profileLogout);
routers.get("/user/profile", validAuth, userProfile);
routers.put("/update/organization", validAuth, craeteOrganization);
routers.get("/read/organization", validAuth, userOrganization);
routers.put(
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
routers.post(
  "/material-classification/create",
  validAuth,
  addMaterialClassification
);
routers.get("/material-classification/read", validAuth, allScrapList);
routers.put(
  "/organization/update/add-classification",
  validAuth,
  selectScrapMaterial
);

module.exports = { routers };
