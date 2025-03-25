const { auctionModel } = require("../../models/auction");
const { catalogueActivity } = require("../../models/catalogueActivity");
const { catalogueModel } = require("../../models/catalogueModel");
const {
  inspectionRequestModel,
} = require("../../models/inspectionRequestModel");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");
require("dotenv").config();

const notApprovedCatalogues = asyncHandler(async (req, res) => {
  const { auctionId, id } = req.params;
  const { message } = req.body;
  const userId = req.userId;
  const auction = await auctionModel.findById(auctionId);
  if (!auction) {
    throw new ApiError(404, "Auction not found");
  }
  const catalogue = await catalogueModel.findByIdAndUpdate(
    id,
    {
      $set: {
        "industryApproval.status": "notApproval",
        "industryApproval.approvalId": userId,
      },
    },
    {
      new: true,
    }
  );
  const catalogueActivitys = await catalogueActivity.create({
    catalogue: catalogue._id,
    activityType: "commands",
    profile: userId,
    commands: message,
  });

  const catalogueDetails = await catalogueModel.findByIdAndUpdate(id, {
    $push: { activityId: catalogueActivitys._id },
  });
  return res.status(200).json(new ApiResponse(200, catalogueDetails));
});

const approvedCatalogues = asyncHandler(async (req, res) => {
  const { auctionId, id } = req.params;
  const userId = req.userId;
  const auction = await auctionModel.findById(auctionId);
  if (!auction) {
    throw new ApiError(404, "Auction not found");
  }
  const catalogue = await catalogueModel.findByIdAndUpdate(
    id,
    {
      $set: {
        "industryApproval.status": "approval",
        "industryApproval.approvalId": userId,
      },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(new ApiResponse(200, catalogue));
});

const inspectionAcceptance = asyncHandler(async (req, res) => {
  const { accpetanceStatus } = req.body;
  const { id } = req.params;

  const inspection = await inspectionRequestModel.findById(id);
  if (!inspection) {
    throw new ApiError(400, "Inpection request is not found.");
  }
  const updateInspection = await inspectionRequestModel.findByIdAndUpdate(
    id,
    { requestStatus: accpetanceStatus },
    { new: true }
  );
  return res.status(200).json(new ApiResponse(200, updateInspection));
});

module.exports = {
  notApprovedCatalogues,
  approvedCatalogues,
  inspectionAcceptance,
};
