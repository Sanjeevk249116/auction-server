const { auctionModel } = require("../../models/auction");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const readAllAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const filter = auctionType ? { auctionType } : {};
    const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch auction list.");
  }
});
const readTodayAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const filter = { status: "today" };
    if (auctionType) {
      filter.auctionType = auctionType;
    }
    const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch auction today.");
  }
});
const readUpcommingAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const filter = { status: "upcomming" };
    if (auctionType) {
      filter.auctionType = auctionType;
    }
    const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch auction today.");
  }
});

const readCompletedAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const filter = { status: "completed" };
    if (auctionType) {
      filter.auctionType = auctionType;
    }
    const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch auction today.");
  }
});

const singleSellerAuctionList = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const { id } = req.params;
    const status = req.query.status;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const filter = { sellerId: id };
    if (auctionType) {
      filter.auctionType = auctionType;
    }
    if (status) {
      filter.status = status;
    }

    const auction = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auction));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "cannot find auction for this seller.");
  }
});

module.exports = {
  readAllAuction,
  readTodayAuction,
  readUpcommingAuction,
  readCompletedAuction,
  singleSellerAuctionList,
};
