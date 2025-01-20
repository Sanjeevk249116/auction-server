const { organizationModel } = require("../../models/organization.models");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

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

module.exports = { readAllSeller };
