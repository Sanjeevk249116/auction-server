const { default: mongoose } = require("mongoose");
const { auctionModel } = require("../../models/auction");
const { documentUploadModel } = require("../../models/document");
const {
  inspectionRequestModel,
} = require("../../models/inspectionRequestModel");
const { organizationModel } = require("../../models/organization.models");
const { transactionModel } = require("../../models/transaction");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const readBuyerDocuments = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const organization = await organizationModel.findOne({ owner: userId });
  if (!organization) {
    throw new ApiError(400, "organization not found.");
  }
  const document = await documentUploadModel
    .find({ organization: organization?._id })
    .select("-organization");
  return res.status(200).json(new ApiResponse(200, document));
});

const handleDateSetUp = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const transactionChart = asyncHandler(async (req, res) => {
  const debitsAmount = await transactionModel.aggregate([
    {
      $project: {
        createdAt: 1,
        amount: 1,
      },
    },
  ]);

  const amountDebited = debitsAmount.map((item) => ({
    date: handleDateSetUp(item.createdAt),
    totalAmount: item.amount,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, { amountDebited: amountDebited, amountCredited: [] })
    );
});

const readInspectionRequest = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 30;
  const inspectionRequest = await inspectionRequestModel.aggregate([
    {
      $match: { profile: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: "auctionmodels",
        foreignField: "_id",
        localField: "auctionId",
        as: "auction",
      },
    },
    {
      $unwind: {
        path: "$auction",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: { auctionId: 0 },
    },

    {
      $sort: {
        inspectionDate: -1,
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);
  return res.status(200).json(new ApiResponse(200, inspectionRequest));
});

const getAllAuctionAnyliticsForBuyer = asyncHandler(async (req, res) => {
  const userId = req.userId;
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

  const organization = await organizationModel.findOne({ owner: userId });
  if (!organization) {
    throw new ApiError(400, "user does not exist.");
  }

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

const getAuctionsWithPcbRequired = asyncHandler(async (req, res) => {
  const auctionType = req.query.auctionType;
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 30;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const matchStage = {
    "auctionSchedule.startDate": { $gte: today },
    "offers.requiresPCBCertificate": true,
  };

  if (auctionType) {
    matchStage.auctionType = auctionType;
  }

  const auction = await auctionModel.aggregate([
    {
      $lookup: {
        from: "offersmodels",
        localField: "offers",
        foreignField: "_id",
        as: "offers",
      },
    },
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$_id",
        auction: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$auction" },
    },
    { $sort: { "auctionSchedule.startDate": 1 } },
    { $skip: skip },
    { $limit: limit },
  ]);
  return res.status(200).json(new ApiResponse(200, auction));
});

module.exports = {
  readBuyerDocuments,
  transactionChart,
  readInspectionRequest,
  getAllAuctionAnyliticsForBuyer,
  getAuctionsWithPcbRequired,
};
