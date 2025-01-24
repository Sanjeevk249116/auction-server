const express = require("express");
const { validAuth } = require("../middleware/auction.middleware");
const {
  readTodayAuction,
  readUpcommingAuction,
  singleSellerAuctionList,
  readAllAuction,
  readCompletedAuction,
  readSingleAuction,
} = require("../controllers/commonController/read");
const commanRouter = express.Router();

commanRouter.get("/auction/read/all-events", validAuth, readAllAuction);

commanRouter.get("/auction/read/today-auctions", validAuth, readTodayAuction);
commanRouter.get(
  "/auction/read/upcoming-auctions",
  validAuth,
  readUpcommingAuction
);
commanRouter.get(
  "/auction/read/completed-auctions",
  validAuth,
  readCompletedAuction
);
commanRouter.get(
  "/auction/read/single-seller-auctions/:id",
  validAuth,
  singleSellerAuctionList
);

commanRouter.get("/read/single-auction/:id", validAuth, readSingleAuction);
commanRouter.get("/auction/read/all-public-auctions", readAllAuction);
commanRouter.get("/auction/read/today-public-auctions", readTodayAuction);
commanRouter.get(
  "/auction/read/upcoming-public-auctions",
  readUpcommingAuction
);

module.exports = { commanRouter };
