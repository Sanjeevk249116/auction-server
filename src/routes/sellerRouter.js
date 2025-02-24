const express = require("express");
const { sellerAuthenticate } = require("../middleware/sellerAuthenticate");
const {
  auctionList,
  sellerLiveAuction,
} = require("../controllers/seller/read");
const { createAuctionAnalytics } = require("../controllers/seller/create");
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

module.exports = { sellerRouter };
