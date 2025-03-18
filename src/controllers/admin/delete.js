const { coordinatorModel } = require("../../models/coordinator");
const { materialClassificationModel } = require("../../models/MaterialScrap");
const { subscriptionmodels } = require("../../models/Subscription.model");
const { ApiError } = require("../../utils/apiError");
const { ApiResponse } = require("../../utils/apiResponse");
const { asyncHandler } = require("../../utils/asyncHandler");

const deleteCoordinator = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await coordinatorModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json(new ApiResponse(200, "coordinator delete successfully."));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Failed to delete coordinator.");
  }
});

const deleteScrapItems = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const scrap = await materialClassificationModel.findByIdAndDelete(id);
  if (!scrap) {
    throw new ApiError(400, "Scrap items is not exist.");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "delete scrap successfully."));
});

const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscription = await subscriptionmodels.findByIdAndDelete(id);
  if (!subscription) {
    throw new ApiError(400, "Subscription not found.");
  }
  return res
    .status(200)
    .json( new ApiResponse(200, "Subscription plane delete successfully."));
});

module.exports = {
  deleteCoordinator,
  deleteScrapItems,
  deleteSubscriptionPlan,
};
