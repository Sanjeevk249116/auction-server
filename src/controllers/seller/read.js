const { default: mongoose } = require("mongoose");
const { auctionModel } = require("../../models/auction");
const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { offersModel } = require("../../models/offer");

const auctionList = asyncHandler(async (req, res) => {
  const userId = req.userId;
  try {
    const { auctionType, filter = "all", skip = 0, limit = 30 } = req.query;
    const parsedSkip = parseInt(skip);
    const parsedLimit = parseInt(limit);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const now = new Date();
    const organization = await organizationModel.findOne({ owner: userId });
    let matchStage = {};

    switch (filter.toLowerCase()) {
      case "today":
        matchStage = {
          "auctionSchedule.startDate": { $gte: today, $lt: tomorrow },
        };
        await auctionModel.updateMany(
          {
            "auctionSchedule.startDate": { $gte: today, $lt: tomorrow },
            filter: { $ne: "today" },
          },
          { $set: { filter: "today" } }
        );
        break;

      case "upcoming":
        matchStage = { "auctionSchedule.startDate": { $gt: now } };
        await auctionModel.updateMany(
          {
            "auctionSchedule.startDate": { $gt: now },
            filter: { $ne: "upcoming" },
          },
          { $set: { filter: "upcoming" } }
        );
        break;

      case "completed":
        matchStage = { "auctionSchedule.startDate": { $lt: today } };
        await auctionModel.updateMany(
          {
            "auctionSchedule.startDate": { $lt: today },
            filter: { $ne: "completed" },
          },
          { $set: { filter: "completed" } }
        );
        break;

      case "all":
      default:
        matchStage = { "auctionSchedule.startDate": { $gte: today } };
        break;
    }

    if (auctionType) {
      matchStage.auctionType = auctionType;
    }
    matchStage.sellerId = new mongoose.Types.ObjectId(organization._id);
    const auctions = await auctionModel.aggregate([
      { $match: matchStage },
      { $sort: { "auctionSchedule.startDate": 1 } },
      { $skip: parsedSkip },
      { $limit: parsedLimit },
      {
        $lookup: {
          from: "cataloguemodels",
          localField: "catalogue",
          foreignField: "_id",
          as: "catalogue",
        },
      },
      {
        $unwind: {
          path: "$catalogue",
          preserveNullAndEmptyArrays: true, // Keeps the auction even if catalogue is missing
        },
      },
    ]);

    return res.status(200).json(new ApiResponse(200, auctions));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Failed to fetch auction list.");
  }
});

const sellerLiveAuction = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const organization = await organizationModel.findOne({ owner: userId });
  if (!organization) {
    throw new ApiError(404, "organization not found.");
  }
  const currentTime = new Date();
  const auction = await auctionModel.aggregate([
    {
      $match: {
        "auctionSchedule.startingTime": { $gte: currentTime },
        "auctionSchedule.endingTime": { $lte: currentTime },
      },
    },
    {
      $sort: { "auctionSchedule.startDate": 1 },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, { liveAuctions: auction }));
});

const singleSellerOffers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const offer = await offersModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "emdmodels",
        localField: "depositedBy",
        foreignField: "_id",
        as: "depositedBy",
        pipeline: [
          {
            $lookup: {
              from: "profilemodels",
              localField: "profile",
              foreignField: "_id",
              as: "profile",
            },
          },
          {
            $addFields: {
              email: { $arrayElemAt: ["$profile.email", 0] },
              phoneNumber: { $arrayElemAt: ["$profile.phoneNumber", 0] },
            },
          },
          { $project: { profile: 0 } },
        ],
      },
    },
  ]);

  if (!offer) {
    throw new ApiError(400, "Offer not found.");
  }
  return res.status(200).json(new ApiResponse(200, offer[0]));
});

module.exports = { auctionList, sellerLiveAuction,singleSellerOffers };
