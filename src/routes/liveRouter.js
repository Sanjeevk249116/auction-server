const express = require("express");
const { liveAuctionList, liveSingleAuctionOffers } = require("../controllers/liveRoom/ReadLiveAuction");
const { buyerAuthenticate } = require("../middleware/buyerAuthenticate");
const liveRouter = express.Router();

liveRouter.get("/auction/read/live-auction", buyerAuthenticate, liveAuctionList);
liveRouter.get("/auction/read/emd-offers", buyerAuthenticate, liveSingleAuctionOffers);

module.exports = { liveRouter };
