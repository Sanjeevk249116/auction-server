const express = require("express");
const {
  readAllSeller,
  readSingleAccount,
  readClassificationMaterial,
  readAllBuyer,
  readCoordinator,
  readAllDocuments,
  auctionAnalystics,
  singleSellerAuctionList,
  singleOrganizationWallet,
  singleAuctionCatalogueDetails,
  readArchivedSubscription,
} = require("../controllers/admin/read");
const { adminAuthenticate } = require("../middleware/adminAuthenticate");
const {
  createCoordinator,
  updateCoordinator,
  verifyDocument,
  rejectDocument,
  approvedCatalogue,
  notApprovedCatalogue,
  startingPriceUpdate,
  updateSubscription,
  archivedSubscriptionPlan,
  unarchivedSubscriptionPlan,
} = require("../controllers/admin/update");
const {
  deleteCoordinator,
  deleteScrapItems,
  deleteSubscriptionPlan,
} = require("../controllers/admin/delete");
const {
  createAuction,
  createOffer,
  addMaterialClassification,
  createCatalogue,
  createSubscription,
} = require("../controllers/admin/create");

const { upload } = require("../middleware/multer.middleware");
const {
  verifyAccountAndOrganization,
  blockrdAccountAndOrganization,
  iniviteNewSeller,
} = require("../controllers/profile");
const {
  readAllAuction,
  readTodayAuction,
  readUpcommingAuction,
  readCompletedAuction,
  singleOffers,
} = require("../controllers/commonController/read");
const {
  startingPriceApproval,
} = require("../controllers/commonController/update");

const adminRouter = express.Router();

adminRouter.get("/profile/read/all-sellers", adminAuthenticate, readAllSeller);
adminRouter.get("/profile/read/all-traders", adminAuthenticate, readAllBuyer);
adminRouter.get(
  "/profile/read/single-account/:id",
  adminAuthenticate,
  readSingleAccount
);
adminRouter.get("/coordinator/read", adminAuthenticate, readCoordinator);
adminRouter.post("/coordinator/create", adminAuthenticate, createCoordinator);
adminRouter.put(
  "/coordinator/update/:id",
  adminAuthenticate,
  updateCoordinator
);
adminRouter.delete(
  "/coordinator/delete/:id",
  adminAuthenticate,
  deleteCoordinator
);

adminRouter.post("/auction/create/new/:id", adminAuthenticate, createAuction);
adminRouter.post(
  "/auction/create/new-offer/:id",
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
adminRouter.delete(
  "/material-classification/delete/:id",
  adminAuthenticate,
  deleteScrapItems
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

adminRouter.get(
  "/profile/read/admin-analytics",
  adminAuthenticate,
  auctionAnalystics
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
  "/auction/read/admin/upcoming-auctions",
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
  "/auction/read/admin/single-offer/:id",
  adminAuthenticate,
  singleOffers
);

adminRouter.get(
  "/wallet/read/single-wallet/:id",
  adminAuthenticate,
  singleOrganizationWallet
);

adminRouter.get(
  "/catalogue/read/catalogue-details/:id",
  adminAuthenticate,
  singleAuctionCatalogueDetails
);

adminRouter.put(
  "/catalogue/create/upload-catalogue/:id",
  adminAuthenticate,
  upload.single("file"),
  createCatalogue
);

adminRouter.put(
  "/catalogue/update/admin/catalogue-approvale/:auctionId/:id",
  adminAuthenticate,
  approvedCatalogue
);

adminRouter.put(
  "/catalogue/update/admin/catalogue-notApproval/:auctionId/:id",
  adminAuthenticate,
  notApprovedCatalogue
);

adminRouter.put(
  "/auction/update/add-starting-price/:id",
  adminAuthenticate,
  startingPriceUpdate
);

adminRouter.put(
  "/auction/update/admin/starting-price-approval/:id",
  adminAuthenticate,
  startingPriceApproval
);

adminRouter.post(
  "/subscription/create/new-subscription",
  adminAuthenticate,
  createSubscription
);

adminRouter.put(
  "/subscription/update/:id",
  adminAuthenticate,
  updateSubscription
);

adminRouter.put(
  "/subscription/update/archive/:id",
  adminAuthenticate,
  archivedSubscriptionPlan
);

adminRouter.put(
  "/subscription/update/unarchive/:id",
  adminAuthenticate,
  unarchivedSubscriptionPlan
);

adminRouter.get(
  "/subscription/read/archive",
  adminAuthenticate,
  readArchivedSubscription
);

adminRouter.delete(
  "/subscription/delete/:id",
  adminAuthenticate,
  deleteSubscriptionPlan
);

module.exports = { adminRouter };
