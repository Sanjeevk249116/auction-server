const { auctionModel } = require("../../models/auction");
const mongoose = require("mongoose");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { documentUploadModel } = require("../../models/document");
const { walletModel } = require("../../models/wallet.model");
const { transactionModel } = require("../../models/transaction");
const { offersModel } = require("../../models/offer");
const { catalogueModel } = require("../../models/catalogueModel");

const readAllAuction = asyncHandler(async (req, res) => {
  try {
    const auctionType = req.query.auctionType;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const matchStage = {
      "auctionSchedule.startDate": { $gte: today },
    };

    if (auctionType) {
      matchStage.auctionType = auctionType;
    }

    const auctions = await auctionModel.aggregate([
      { $match: matchStage },
      { $sort: { "auctionSchedule.startDate": 1 } },
      { $skip: skip },
      { $limit: limit },
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
    const auctions = await auctionModel.aggregate([
      { $match: filter },
      { $sort: { "auctionSchedule.startDate": 1 } },
      { $skip: skip },
      { $limit: limit },
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
    // const auctions = await auctionModel.find(filter).skip(skip).limit(limit);
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
    const auctions = await auctionModel.aggregate([
      { $match: filter },
      { $sort: { "auctionSchedule.startDate": 1 } },
      { $skip: skip },
      { $limit: limit },
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
      { $sort: { "auctionSchedule.startDate": 1 } },
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

const readSingleAuction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const auctionDetails = await auctionModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "offersmodels",
        localField: "offers",
        foreignField: "_id",
        as: "offers",
        pipeline: [
          {
            $lookup: {
              from: "scrapimagemodels",
              localField: "offerImage",
              foreignField: "_id",
              as: "offerImage",
            },
          },
          {
            $lookup: {
              from: "emdmodels",
              localField: "_id",
              foreignField: "offers",
              as: "emdDeposits",
            },
          },
          {
            $addFields: {
              deposited: {
                $anyElementTrue: [
                  {
                    $map: {
                      input: "$emdDeposits",
                      as: "deposit",
                      in: {
                        $eq: [
                          "$$deposit.profile",
                          new mongoose.Types.ObjectId(userId),
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
          { $project: { emdDeposits: 0 } },
        ],
      },
    },
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
    {
      $lookup: {
        from: "inspectionrequestmodels",
        localField: "inspectionRequest",
        foreignField: "_id",
        as: "inspectionRequest",
        pipeline: [
          {
            $match: {
              profile: new mongoose.Types.ObjectId(userId),
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$inspectionRequest",
        preserveNullAndEmptyArrays: true, 
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, auctionDetails[0]));
});

const downloadSingleDocument = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const document = await documentUploadModel.findById(id);
    if (!document) {
      throw new ApiError(404, "Document not found");
    }
    const fileUrl = document.url;
    if (!fileUrl) {
      throw new ApiError(404, "File not found");
    }

    return res.status(200).json(new ApiResponse(200, { fileUrl }));
  } catch (error) {
    throw new ApiError(500, "Error retrieving file URL", error);
  }
});

const myWallet = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const wallet = await walletModel.aggregate([
    {
      $match: { profile: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "bankaccountmodels",
        localField: "bankAccounts",
        foreignField: "_id",
        as: "bankAccounts",
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, wallet[0]));
});

const transactionHistory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const transaction = await transactionModel.aggregate([
    {
      $match: {
        profile: new mongoose.Types.ObjectId(userId),
        types: "recent",
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, transaction));
});

const withdrawAmount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const transaction = await transactionModel.aggregate([
    {
      $match: {
        profile: new mongoose.Types.ObjectId(userId),
        types: "withdraw",
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, transaction));
});

const refundAmount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const transaction = await transactionModel.aggregate([
    {
      $match: {
        profile: new mongoose.Types.ObjectId(userId),
        types: "refund",
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, transaction));
});

const singleOffers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const offer = await offersModel.findById(id);
  if (!offer) {
    throw new ApiError(400, "Offer not found.");
  }
  return res.status(200).json(new ApiResponse(200, offer));
});

const auctionCatalogue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const catalogue = await catalogueModel.aggregate([
    {
      $match: {
        auction: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "catalogueactivities",
        localField: "activityId",
        foreignField: "_id",
        as: "activityId",
      },
    },
    {
      $addFields: {
        downloadedBy: {
          $filter: {
            input: "$activityId",
            as: "activity",
            cond: { $eq: ["$$activity.activityType", "downloadedBy"] },
          },
        },
        viewedBy: {
          $filter: {
            input: "$activityId",
            as: "activity",
            cond: { $eq: ["$$activity.activityType", "viewedBy"] },
          },
        },
        tradersRejected: {
          $filter: {
            input: "$activityId",
            as: "activity",
            cond: { $eq: ["$$activity.activityType", "tradersRejected"] },
          },
        },
        tradersConfirmed: {
          $filter: {
            input: "$activityId",
            as: "activity",
            cond: { $eq: ["$$activity.activityType", "tradersConfirmed"] },
          },
        },
        commands: {
          $filter: {
            input: "$activityId",
            as: "activity",
            cond: { $eq: ["$$activity.activityType", "commands"] },
          },
        },
      },
    },
    {
      $project: {
        activityId: 0,
        auction: 0,
      },
    },
  ]);
  return res.status(200).json(new ApiResponse(200, catalogue[0]));
});

const getAllAuctionAnylitics = asyncHandler(async (req, res) => {
  const now = new Date();
  await auctionModel.updateMany(
    {
      "auctionSchedule.startDate": { $gt: now },
      status: { $ne: "upcomming" },
    },
    { $set: { status: "upcomming" } },
    { new: true }
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await auctionModel.updateMany(
    {
      "auctionSchedule.startDate": { $lt: today },
      status: { $ne: "completed" },
    },
    { $set: { status: "completed" } }
  );

  const upcomingAuctions = await auctionModel.find({ status: "upcomming" });
  const completedAuctions = await auctionModel.find({ status: "completed" });
  const analytics = {
    upcomingAuctions: upcomingAuctions.length,
    completedAuctions: completedAuctions.length,
    wonAuctions: 0,
    depositedOffers: 0,
  };

  return res.status(200).json(new ApiResponse(200, analytics));
});

module.exports = {
  readAllAuction,
  readTodayAuction,
  readUpcommingAuction,
  readCompletedAuction,
  readSingleAuction,
  downloadSingleDocument,
  myWallet,
  transactionHistory,
  withdrawAmount,
  refundAmount,
  singleOffers,
  auctionCatalogue,
  getAllAuctionAnylitics
};
