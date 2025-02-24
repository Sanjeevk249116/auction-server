const { auctionModel } = require("../../models/auction");
const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const createAuctionAnalytics = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const organization = await organizationModel.findOne({ owner: userId });
  if (!organization) {
    throw new ApiError(404, "Organization not found.");
  }
  const auctionAnalytics = await auctionModel.aggregate([
    {
      $match: {
        sellerId: organization._id,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Format createdAt to YYYY-MM-DD
        },
        count: { $sum: 1 }, 
      },
    },
    {
      $sort: { _id: 1 }, // Sort by date in ascending order
    },
  ]);
  return res.status(200).json(new ApiResponse(200, auctionAnalytics));
});

module.exports = { createAuctionAnalytics };
