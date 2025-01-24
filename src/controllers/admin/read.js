const mongoose = require("mongoose");
const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
const { coordinatorModel } = require("../../models/coordinator");
const { auctionModel } = require("../../models/auction");
const { documentUploadModel } = require("../../models/document");

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
    console.log(objectId);
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

const readSingleAuction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const singleAuction = await auctionModel.findById(id);
  if (!singleAuction) {
    throw new ApiError(400, "Auction not found.");
  }

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
        ],
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, auctionDetails[0]));
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

module.exports = {
  readAllSeller,
  readAllBuyer,
  readSingleAccount,
  readCoordinator,
  readSingleAuction,
  readClassificationMaterial,
  readAllDocuments,
  downloadSingleDocument,
};
