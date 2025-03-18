const express = require("express");
const { sellerAuthenticate } = require("../middleware/sellerAuthenticate");
const {
  auctionList,
  sellerLiveAuction,
  singleSellerOffers,
} = require("../controllers/seller/read");
const { createAuctionAnalytics } = require("../controllers/seller/create");
const { startingPriceApproval, startingPriceReject } = require("../controllers/commonController/update");
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

module.exports = { sellerRouter };
