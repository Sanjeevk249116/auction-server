const { auctionModel } = require("../../models/auction");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const readAllAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filter = {
      "auctionSchedule.startDate": {
        $gte: today,
      },
    };

    if (auctionType) {
      filter.auctionType = auctionType;
    }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    await auctionModel.updateMany(
      {
        "auctionSchedule.startDate": {
          $gte: today,
          $lt: tomorrow,
        },
        status: { $ne: "today" },
      },
      { $set: { status: "today" } }
    );

    const filter = {
      "auctionSchedule.startDate": {
        $gte: today,
        $lt: tomorrow,
      },
    };

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
    const now = new Date();

    await auctionModel.updateMany(
      {
        "auctionSchedule.startDate": { $gt: now },
        status: { $ne: "upcomming" },
      },
      { $set: { status: "upcomming" } }
    );

    const filter = {
      "auctionSchedule.startDate": {
        $gte: now,
      },
    };
    if (auctionType) {
      filter.auctionType = auctionType;
    }
    const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Failed to fetch auction upcomming.");
  }
});

const readCompletedAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const filter = { status: "completed" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update status to completed for auctions before today
    await auctionModel.updateMany(
      {
        "auctionSchedule.startDate": { $lt: today },
        status: { $ne: "completed" },
      },
      { $set: { status: "completed" } }
    );

    if (auctionType) {
      filter.auctionType = auctionType;
    }
    const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch auction completed.");
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
