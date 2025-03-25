const express = require("express");
const { sellerAuthenticate } = require("../middleware/sellerAuthenticate");
const {
  auctionList,
  sellerLiveAuction,
  singleSellerOffers,
  getAllAuctionAnylitics,
  inpectionResponse,
} = require("../controllers/seller/read");
const { createAuctionAnalytics } = require("../controllers/seller/create");
const {
  startingPriceApproval,
  startingPriceReject,
} = require("../controllers/commonController/update");
const {
  notApprovedCatalogues,
  approvedCatalogues,
  inspectionAcceptance,
} = require("../controllers/seller/update");
const sellerRouter = express.Router();

sellerRouter.get("/auction/read/my-auction", sellerAuthenticate, auctionList);
sellerRouter.get(
  "/profile/read/created-auction-analytics",
  sellerAuthenticate,
  createAuctionAnalytics
);
sellerRouter.get(
  "/auction/read/seller-live-auction",
  sellerAuthenticate,
  sellerLiveAuction
);
sellerRouter.get(
  "/auction/read/seller/single-offer/:id",
  sellerAuthenticate,
  singleSellerOffers
);

sellerRouter.put(
  "/auction/update/seller/starting-price-approval/:id",
  sellerAuthenticate,
  startingPriceApproval
);

sellerRouter.put(
  "/auction/update/seller/starting-price-reject/:id",
  sellerAuthenticate,
  startingPriceReject
);

sellerRouter.put(
  "/catalogue/update/catalogue-notApproval/:auctionId/:id",
  sellerAuthenticate,
  notApprovedCatalogues
);

sellerRouter.put(
  "/catalogue/update/catalogue-approvale/:auctionId/:id",
  sellerAuthenticate,
  approvedCatalogues
);

sellerRouter.get(
  "/profile/read/seller/analytics",
  sellerAuthenticate,
  getAllAuctionAnylitics
);

sellerRouter.get(
  "/auction/read/requested-inspection",
  sellerAuthenticate,
  inpectionResponse
);

sellerRouter.put(
  "/auction/read/requested-inspection-appectance/:id",
  sellerAuthenticate,
  inspectionAcceptance
);

module.exports = { sellerRouter };
