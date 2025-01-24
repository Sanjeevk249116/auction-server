const { auctionModel } = require("../../models/auction");
const { documentUploadModel } = require("../../models/document");
const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

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

module.exports = { getAllAuctionAnylitics, readBuyerDocuments };
