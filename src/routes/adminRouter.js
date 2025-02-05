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

const { upload } = require("../middleware/multer.middleware");
const {
  verifyAccountAndOrganization,
  blockrdAccountAndOrganization,
  iniviteNewSeller,
} = require("../controllers/profile");

const adminRouter = express.Router();

adminRouter.get("/profile/read/all-sellers", adminAuthenticate, readAllSeller);
adminRouter.get("/profile/read/all-traders", adminAuthenticate, readAllBuyer);
adminRouter.get(
  "/profile/read/single-account/:id",
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

adminRouter.put(
  "/profile/update/admin/verify-account/:id",
  adminAuthenticate,
  verifyAccountAndOrganization
);

adminRouter.put(
  "/profile/update/admin/blocked-account/:id",
  adminAuthenticate,
  blockrdAccountAndOrganization
);
adminRouter.post(
  "/authenticate/invte-industry",
  adminAuthenticate,
  iniviteNewSeller
);

module.exports = { adminRouter };
