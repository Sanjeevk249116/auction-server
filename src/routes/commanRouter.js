const express = require("express");
const { validAuth } = require("../middleware/auction.middleware");
const {
  readTodayAuction,
  readUpcommingAuction,
  readAllAuction,
  readCompletedAuction,
  readSingleAuction,
  downloadSingleDocument,
  transactionHistory,
  withdrawAmount,
  refundAmount,
  singleOffers,
  auctionCatalogue,
  getAllAuctionAnylitics,
} = require("../controllers/commonController/read");
const { myWallet } = require("../controllers/commonController/read");
const {
  addBankAccount,
  createTransaction,
} = require("../controllers/commonController/update");
const { profileLogout } = require("../controllers/auth.controller");
const commanRouter = express.Router();

commanRouter.get("/auction/read/all-events", validAuth, readAllAuction);
commanRouter.put("/authenticate/logout", validAuth, profileLogout);
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
  "/auction/read/single-auction/:id",
  validAuth,
  readSingleAuction
);
commanRouter.get("/auction/read/all-public-auctions", readAllAuction);
commanRouter.get("/auction/read/today-public-auctions", readTodayAuction);
commanRouter.get(
  "/auction/read/upcoming-public-auctions",
  readUpcommingAuction
);
commanRouter.get(
  "/documents/read/single-file/:id",
  validAuth,
  downloadSingleDocument
);
commanRouter.get("/profile/read/analytics", validAuth, getAllAuctionAnylitics);
commanRouter.get("/wallet/read/my-wallet", validAuth, myWallet);
commanRouter.put("/profile/update/add-bank-details", validAuth, addBankAccount);
commanRouter.post(
  "/wallet/create/my-wallet/transactions",
  validAuth,
  createTransaction
);
commanRouter.get(
  "/wallet/read/my-wallet/transactions",
  validAuth,
  transactionHistory
);
commanRouter.get(
  "/wallet/read/my-wallet/withdrawal",
  validAuth,
  withdrawAmount
);
commanRouter.get(
  "/wallet/read/my-wallet/refund-history",
  validAuth,
  refundAmount
);
commanRouter.get(
  "/auction/read/admin/single-offer/:id",
  validAuth,
  singleOffers
);

commanRouter.get(
  "/catalogue/read/all-catalogues/:id",
  validAuth,
  auctionCatalogue
);

module.exports = { commanRouter };
