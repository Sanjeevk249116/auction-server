const mongoose = require("mongoose");
const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { coordinatorModel } = require("../../models/coordinator");
const { documentUploadModel } = require("../../models/document");
const { auctionModel } = require("../../models/auction");

const readAllSeller = asyncHandler(async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const sellerWithOwner = await organizationModel.aggregate([
      { $match: { accountType: "seller" } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "profilemodels",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                email: 1,
                phoneNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    ]);
    return res.status(200).json(new ApiResponse(200, sellerWithOwner));
  } catch (error) {
    throw new ApiError(400, "Internal server error.");
  }
});
const readAllBuyer = asyncHandler(async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 30;
    const buyerList = await organizationModel.aggregate([
      { $match: { accountType: "buyer" } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "profilemodels",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                email: 1,
                phoneNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    ]);
    return res.status(200).json(new ApiResponse(200, buyerList));
  } catch (error) {
    throw new ApiError(400, "Internal server error.");
  }
});

const readSingleAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const sellerWithOwner = await organizationModel.aggregate([
      { $match: { _id: objectId } },
      {
        $lookup: {
          from: "profilemodels",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                userName: 1,
                email: 1,
                phoneNumber: 1,
              },
            },
          ],
        },
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    ]);
    return res.status(200).json(new ApiResponse(200, sellerWithOwner[0]));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Failed to fetch single account.");
  }
});

const readCoordinator = asyncHandler(async (req, res) => {
  try {
    const coordinator = await coordinatorModel.find();
    return res.status(200).json(new ApiResponse(200, coordinator));
  } catch (error) {
    throw new ApiError(400, "Failed to fetch coordinator list");
  }
});

const readClassificationMaterial = asyncHandler(async (req, res) => {
  const scrapList = await materialClassificationModel.find();
  return res.status(200).json(new ApiResponse(200, scrapList));
});

const readAllDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const document = await documentUploadModel
    .find({ organization: id })
    .select("-organization");
  return res.status(200).json(new ApiResponse(200, document));
});

const auctionAnalystics = asyncHandler(async (req, res) => {
  const today = new Date();
  const now = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const numberOfIndustry = await organizationModel.find({
    accountType: "seller",
  });
  const numberOfTraders = await organizationModel.find({
    accountType: "buyer",
  });

  const todayAuctions = await auctionModel.find({
    "auctionSchedule.startDate": { $gte: today, $lt: tomorrow },
  });

  const upcomingAuctions = await auctionModel.find({
    "auctionSchedule.startDate": { $gte: now },
  });

  const completedAuctions = await auctionModel.find({
    "auctionSchedule.startDate": { $lt: today },
  });

  const analytics = {
    numberOfIndustry: numberOfIndustry.length,
    numberOfTraders: numberOfTraders?.length,
    todayAuctions: todayAuctions.length,
    upcomingAuctions: upcomingAuctions.length,
    completedAuctions:completedAuctions.length
  };

  return res.status(200).json(new ApiResponse(200, analytics));
});

module.exports = {
  readAllSeller,
  readAllBuyer,
  readSingleAccount,
  readCoordinator,
  readClassificationMaterial,
  readAllDocuments,
  auctionAnalystics,
};
