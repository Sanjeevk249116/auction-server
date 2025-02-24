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
  ]);
  return res.status(200).json(new ApiResponse(200, inspectionRequest));
});

module.exports = {
  readBuyerDocuments,
  transactionChart,
  readInspectionRequest,
};
