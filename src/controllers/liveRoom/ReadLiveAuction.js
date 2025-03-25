const { auctionModel } = require("../../models/auction");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const liveAuctionList = asyncHandler(async (req, res) => {
  const now = new Date();

  const liveAuctions = await auctionModel.aggregate([
    {
      $match: {
        "auctionSchedule.startingTime": { $lte: now },
        "auctionSchedule.endingTime": { $gte: now },
      },
    },
    {
      $sort: { "auctionSchedule.startingTime": 1 },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, liveAuctions));
});

const liveSingleAuctionOffers = asyncHandler(async (req, res) => {
  const auctionId = req.query.auctionId;
  
});

module.exports = { liveAuctionList, liveSingleAuctionOffers };
